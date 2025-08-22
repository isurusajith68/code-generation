import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table } from "lucide-react";

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
  displayInTable: boolean;
  searchable: boolean;
  sortable: boolean;
}

interface TableConfig {
  displayFields: string[];
  searchableFields: string[];
  sortableFields: string[];
  defaultSort: string;
  defaultSortOrder: "asc" | "desc";
  pageSize: number;
  enableSearch: boolean;
  enablePagination: boolean;
}

interface TableInfo {
  tableName: string;
  entityName: string;
  fields: Field[];
  foreignKey?: string;
  primaryKey?: string;
}

interface TableSettingsProps {
  parentTable: TableInfo;
  setParentTable: React.Dispatch<React.SetStateAction<TableInfo>>;
  parentTableConfig: TableConfig;
  setParentTableConfig: React.Dispatch<React.SetStateAction<TableConfig>>;
}

const TableSettings: React.FC<TableSettingsProps> = ({
  parentTable,
  setParentTable,
  parentTableConfig,
  setParentTableConfig,
}) => {
  const updateField = (
    id: number,
    key: keyof Field,
    value: boolean | string | number,
    isParent: boolean
  ) => {
    if (isParent) {
      setParentTable((prev) => {
        const updatedFields = prev.fields.map((field) =>
          field.id === id ? { ...field, [key]: value } : field
        );

        // Update the table configuration based on field changes
        if (
          key === "displayInTable" ||
          key === "searchable" ||
          key === "sortable"
        ) {
          const updatedField = updatedFields.find((f) => f.id === id);
          if (updatedField) {
            setParentTableConfig((prevConfig) => {
              const newConfig = { ...prevConfig };

              if (key === "displayInTable") {
                if (value) {
                  newConfig.displayFields = [
                    ...new Set([...newConfig.displayFields, updatedField.name]),
                  ];
                } else {
                  newConfig.displayFields = newConfig.displayFields.filter(
                    (name) => name !== updatedField.name
                  );
                }
              }

              if (key === "searchable") {
                if (value) {
                  newConfig.searchableFields = [
                    ...new Set([
                      ...newConfig.searchableFields,
                      updatedField.name,
                    ]),
                  ];
                } else {
                  newConfig.searchableFields =
                    newConfig.searchableFields.filter(
                      (name) => name !== updatedField.name
                    );
                }
              }

              if (key === "sortable") {
                if (value) {
                  newConfig.sortableFields = [
                    ...new Set([
                      ...newConfig.sortableFields,
                      updatedField.name,
                    ]),
                  ];
                } else {
                  newConfig.sortableFields = newConfig.sortableFields.filter(
                    (name) => name !== updatedField.name
                  );
                }
              }

              return newConfig;
            });
          }
        }

        return {
          ...prev,
          fields: updatedFields,
        };
      });
    }
  };

  // Initialize table configuration when fields change
  useEffect(() => {
    if (parentTable.fields.length > 0) {
      setParentTableConfig((prevConfig) => ({
        ...prevConfig,
        displayFields: parentTable.fields
          .filter((f) => f.displayInTable)
          .map((f) => f.name),
        searchableFields: parentTable.fields
          .filter((f) => f.searchable)
          .map((f) => f.name),
        sortableFields: parentTable.fields
          .filter((f) => f.sortable)
          .map((f) => f.name),
      }));
    }
  }, [parentTable.fields, setParentTableConfig]);

  const TableConfigSection = ({
    title,
    fields,
    tableConfig,
    setTableConfig,
    isParent,
  }: {
    title: string;
    fields: Field[];
    tableConfig: TableConfig;
    setTableConfig: React.Dispatch<React.SetStateAction<TableConfig>>;
    isParent: boolean;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Table className="h-5 w-5" />
          {title} Table Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Display Fields */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Display Fields in Table
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {fields.map((field) => (
              <div key={field.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`display-${field.id}-${isParent ? "parent" : "child"}`}
                  checked={field.displayInTable}
                  onChange={(e) =>
                    updateField(
                      field.id,
                      "displayInTable",
                      e.target.checked,
                      isParent
                    )
                  }
                  className="rounded border-gray-300"
                />
                <label
                  htmlFor={`display-${field.id}-${
                    isParent ? "parent" : "child"
                  }`}
                  className="text-sm text-gray-700"
                >
                  {field.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Searchable Fields */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Searchable Fields
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {fields.map((field) => (
              <div key={field.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`search-${field.id}-${isParent ? "parent" : "child"}`}
                  checked={field.searchable}
                  onChange={(e) =>
                    updateField(
                      field.id,
                      "searchable",
                      e.target.checked,
                      isParent
                    )
                  }
                  className="rounded border-gray-300"
                />
                <label
                  htmlFor={`search-${field.id}-${
                    isParent ? "parent" : "child"
                  }`}
                  className="text-sm text-gray-700"
                >
                  {field.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Sortable Fields */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Sortable Fields
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {fields.map((field) => (
              <div key={field.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`sort-${field.id}-${isParent ? "parent" : "child"}`}
                  checked={field.sortable}
                  onChange={(e) =>
                    updateField(
                      field.id,
                      "sortable",
                      e.target.checked,
                      isParent
                    )
                  }
                  className="rounded border-gray-300"
                />
                <label
                  htmlFor={`sort-${field.id}-${isParent ? "parent" : "child"}`}
                  className="text-sm text-gray-700"
                >
                  {field.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Table Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Default Sort Field</Label>
            <select
              value={tableConfig.defaultSort}
              onChange={(e) =>
                setTableConfig({ ...tableConfig, defaultSort: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select field...</option>
              {fields
                .filter((f) => f.sortable)
                .map((field) => (
                  <option key={field.id} value={field.name}>
                    {field.label}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <Label>Sort Order</Label>
            <select
              value={tableConfig.defaultSortOrder}
              onChange={(e) =>
                setTableConfig({
                  ...tableConfig,
                  defaultSortOrder: e.target.value as "asc" | "desc",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          <div>
            <Label>Page Size</Label>
            <Input
              type="number"
              value={tableConfig.pageSize}
              onChange={(e) =>
                setTableConfig({
                  ...tableConfig,
                  pageSize: parseInt(e.target.value) || 10,
                })
              }
              min="1"
              max="100"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`enable-search-${isParent ? "parent" : "child"}`}
                checked={tableConfig.enableSearch}
                onChange={(e) =>
                  setTableConfig({
                    ...tableConfig,
                    enableSearch: e.target.checked,
                  })
                }
                className="rounded border-gray-300"
              />
              <label
                htmlFor={`enable-search-${isParent ? "parent" : "child"}`}
                className="text-sm text-gray-700"
              >
                Enable Search
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`enable-pagination-${isParent ? "parent" : "child"}`}
                checked={tableConfig.enablePagination}
                onChange={(e) =>
                  setTableConfig({
                    ...tableConfig,
                    enablePagination: e.target.checked,
                  })
                }
                className="rounded border-gray-300"
              />
              <label
                htmlFor={`enable-pagination-${isParent ? "parent" : "child"}`}
                className="text-sm text-gray-700"
              >
                Enable Pagination
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <TableConfigSection
        title="Table"
        fields={parentTable.fields}
        tableConfig={parentTableConfig}
        setTableConfig={setParentTableConfig}
        isParent={true}
      />
    </div>
  );
};

export default TableSettings;
