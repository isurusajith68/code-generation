import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface DatabaseTable {
  table_name: string;
  table_schema: string;
  table_type: string;
}

interface TableColumn {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

interface Field {
  id: number;
  name: string;
  label: string;
  type: string;
  required: boolean;
  dbType: string;
  selectOptions: string;
  radioOptions: string;
  defaultValue: string;
}

interface TableInfo {
  tableName: string;
  entityName: string;
  fields: Field[];
  foreignKey?: string;
}

interface DatabaseIntegrationProps {
  parentTable: TableInfo;
  setParentTable: React.Dispatch<React.SetStateAction<TableInfo>>;
  childTable: TableInfo;
  setChildTable: React.Dispatch<React.SetStateAction<TableInfo>>;
}

const DatabaseIntegration: React.FC<DatabaseIntegrationProps> = ({
  parentTable: _parentTable,
  setParentTable,
  childTable: _childTable,
  setChildTable,
}) => {
  // These props are for future functionality
  void _parentTable;
  void _childTable;
  const [selectedSchema, setSelectedSchema] = useState("public");
  const [selectedParentTable, setSelectedParentTable] = useState("");
  const [selectedChildTable, setSelectedChildTable] = useState("");
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [parentColumns, setParentColumns] = useState<TableColumn[]>([]);
  const [childColumns, setChildColumns] = useState<TableColumn[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isLoadingParentColumns, setIsLoadingParentColumns] = useState(false);
  const [isLoadingChildColumns, setIsLoadingChildColumns] = useState(false);

  const loadTables = async (schema: string) => {
    if (!schema) return;

    setIsLoadingTables(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/sys/tables?schema=${schema}`);
      const data = await response.json();
      setTables(data.tables || []);
      setSelectedParentTable("");
      setSelectedChildTable("");
      setParentColumns([]);
      setChildColumns([]);
    } catch (error) {
      console.error("Error loading tables:", error);
      toast.error("Failed to load tables");
      setTables([]);
    } finally {
      setIsLoadingTables(false);
    }
  };

  const loadTableStructure = async (
    tableName: string,
    schema: string,
    isParent: boolean
  ) => {
    if (!tableName || !schema) return;

    if (isParent) {
      setIsLoadingParentColumns(true);
    } else {
      setIsLoadingChildColumns(true);
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(
        `${apiUrl}/sys/tables/${tableName}/structure?schema=${schema}`
      );
      const data = await response.json();

      if (isParent) {
        setParentColumns(data.columns || []);
      } else {
        setChildColumns(data.columns || []);
      }
    } catch (error) {
      console.error("Error loading table structure:", error);
      toast.error(
        `Failed to load ${isParent ? "parent" : "child"} table structure`
      );

      if (isParent) {
        setParentColumns([]);
      } else {
        setChildColumns([]);
      }
    } finally {
      if (isParent) {
        setIsLoadingParentColumns(false);
      } else {
        setIsLoadingChildColumns(false);
      }
    }
  };

  const populateFieldsFromTable = (
    columns: TableColumn[],
    isParent: boolean
  ) => {
    if (columns.length === 0) {
      toast.error("No table columns found");
      return;
    }

    const excludeColumns = ["id"];

    const newFields = columns.map((col) => {
      let fieldType = "text";

      if (col.data_type.includes("boolean")) {
        fieldType = "boolean";
      } else if (
        col.data_type.includes("int") ||
        col.data_type.includes("serial")
      ) {
        fieldType = "number";
      } else if (
        col.data_type.includes("text") ||
        (col.data_type.includes("varchar") && col.data_type.includes("255"))
      ) {
        fieldType = "textarea";
      } else if (col.column_name.toLowerCase().includes("email")) {
        fieldType = "email";
      } else if (
        col.column_name.toLowerCase().includes("date") ||
        col.data_type.includes("date")
      ) {
        fieldType = "date";
      } else if (col.column_name.toLowerCase().includes("password")) {
        fieldType = "password";
      } else if (col.column_name.toLowerCase().endsWith("_id")) {
        fieldType = "select";
      } else if (
        col.column_name.toLowerCase().includes("status") ||
        col.column_name.toLowerCase().includes("type") ||
        col.column_name.toLowerCase().includes("category")
      ) {
        fieldType = "radio";
      }

      const label = col.column_name
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      return {
        id: Date.now() + Math.random(),
        name: col.column_name,
        label: label,
        type: fieldType,
        required: col.is_nullable === "NO",
        dbType: col.data_type.toUpperCase(),
        selectOptions:
          fieldType === "select" ? "Option1, Option2, Option3" : "",
        radioOptions: fieldType === "radio" ? "Active, Inactive" : "",
        defaultValue: fieldType === "boolean" ? "false" : "",
      };
    });

    if (isParent) {
      setParentTable((prev) => ({
        ...prev,
        fields: newFields,
        tableName: selectedParentTable,
        entityName: selectedParentTable
          .replace(/^(operation_|core_|seed_)/, "")
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())
          .replace(/\s/g, ""),
      }));
    } else {
      // Auto-detect foreign key for child table
      const potentialForeignKey =
        columns.find(
          (col) =>
            col.column_name
              .toLowerCase()
              .includes(selectedParentTable.toLowerCase().replace(/s$/, "")) ||
            col.column_name.toLowerCase().includes("parent") ||
            col.column_name.toLowerCase().endsWith("_id")
        )?.column_name || "";

      setChildTable((prev) => ({
        ...prev,
        fields: newFields,
        tableName: selectedChildTable,
        entityName: selectedChildTable
          .replace(/^(operation_|core_|seed_)/, "")
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())
          .replace(/\s/g, ""),
        foreignKey: potentialForeignKey,
      }));
    }

    toast.success(
      `Added ${newFields.length} fields from ${
        isParent ? "parent" : "child"
      } table structure`
    );
  };

  useEffect(() => {
    if (selectedSchema) {
      loadTables(selectedSchema);
    }
  }, [selectedSchema]);

  useEffect(() => {
    if (selectedParentTable && selectedSchema) {
      loadTableStructure(selectedParentTable, selectedSchema, true);
    }
  }, [selectedParentTable, selectedSchema]);

  useEffect(() => {
    if (selectedChildTable && selectedSchema) {
      loadTableStructure(selectedChildTable, selectedSchema, false);
    }
  }, [selectedChildTable, selectedSchema]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          <CardTitle>Database Integration</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Schema Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Database Schema</Label>
            <Select value={selectedSchema} onValueChange={setSelectedSchema}>
              <SelectTrigger>
                <SelectValue placeholder="Select a schema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">public</SelectItem>
                <SelectItem value="seed">seed</SelectItem>
                <SelectItem value="core_data">core_data</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => loadTables(selectedSchema)}
              disabled={isLoadingTables}
              className="w-full"
            >
              {isLoadingTables ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Load Tables
            </Button>
          </div>
        </div>

        {/* Table Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Parent Table */}
          <div className="space-y-4">
            <Label>Parent Table</Label>
            <Select
              value={selectedParentTable}
              onValueChange={setSelectedParentTable}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent table" />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table.table_name} value={table.table_name}>
                    {table.table_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isLoadingParentColumns && (
              <div className="text-sm text-gray-500">Loading columns...</div>
            )}

            {parentColumns.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  Columns ({parentColumns.length}):
                </div>
                <div className="max-h-32 overflow-y-auto text-xs bg-gray-50 p-2 rounded">
                  {parentColumns.map((col) => (
                    <div key={col.column_name} className="flex justify-between">
                      <span>{col.column_name}</span>
                      <span className="text-gray-500">{col.data_type}</span>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  onClick={() => populateFieldsFromTable(parentColumns, true)}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Import Parent Fields
                </Button>
              </div>
            )}
          </div>

          {/* Child Table */}
          <div className="space-y-4">
            <Label>Child Table</Label>
            <Select
              value={selectedChildTable}
              onValueChange={setSelectedChildTable}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select child table" />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table.table_name} value={table.table_name}>
                    {table.table_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isLoadingChildColumns && (
              <div className="text-sm text-gray-500">Loading columns...</div>
            )}

            {childColumns.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  Columns ({childColumns.length}):
                </div>
                <div className="max-h-32 overflow-y-auto text-xs bg-gray-50 p-2 rounded">
                  {childColumns.map((col) => (
                    <div key={col.column_name} className="flex justify-between">
                      <span>{col.column_name}</span>
                      <span className="text-gray-500">{col.data_type}</span>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  onClick={() => populateFieldsFromTable(childColumns, false)}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Import Child Fields
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseIntegration;
