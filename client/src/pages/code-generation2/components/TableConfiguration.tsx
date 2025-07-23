import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";

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
  primaryKey?: string;
}

interface TableConfigurationProps {
  parentTable: TableInfo;
  setParentTable: React.Dispatch<React.SetStateAction<TableInfo>>;
  childTable: TableInfo;
  setChildTable: React.Dispatch<React.SetStateAction<TableInfo>>;
}

const fieldTypes = [
  { value: "text", label: "Text Input" },
  { value: "textarea", label: "Textarea" },
  { value: "number", label: "Number Input" },
  { value: "select", label: "Select Dropdown" },
  { value: "radio", label: "Radio Button" },
  { value: "boolean", label: "Boolean Switch" },
  { value: "date", label: "Date Input" },
  { value: "email", label: "Email Input" },
  { value: "password", label: "Password Input" },
];

const TableConfiguration: React.FC<TableConfigurationProps> = ({
  parentTable,
  setParentTable,
  childTable,
  setChildTable,
}) => {
  const addField = (isParent: boolean) => {
    const newField = {
      id: Date.now(),
      name: "",
      label: "",
      type: "text",
      required: false,
      dbType: "VARCHAR(255)",
      selectOptions: "",
      radioOptions: "",
      defaultValue: "",
    };

    if (isParent) {
      setParentTable((prev) => ({
        ...prev,
        fields: [...prev.fields, newField],
      }));
    } else {
      setChildTable((prev) => ({
        ...prev,
        fields: [...prev.fields, newField],
      }));
    }
  };

  const updateField = (
    id: number,
    key: keyof Field,
    value: string | boolean | number,
    isParent: boolean
  ) => {
    if (isParent) {
      setParentTable((prev) => ({
        ...prev,
        fields: prev.fields.map((field) =>
          field.id === id ? { ...field, [key]: value } : field
        ),
      }));
    } else {
      setChildTable((prev) => ({
        ...prev,
        fields: prev.fields.map((field) =>
          field.id === id ? { ...field, [key]: value } : field
        ),
      }));
    }
  };

  const removeField = (id: number, isParent: boolean) => {
    if (isParent) {
      setParentTable((prev) => ({
        ...prev,
        fields: prev.fields.filter((field) => field.id !== id),
      }));
    } else {
      setChildTable((prev) => ({
        ...prev,
        fields: prev.fields.filter((field) => field.id !== id),
      }));
    }
  };

  const renderFieldRow = (field: Field, isParent: boolean) => (
    <div
      key={field.id}
      className="grid grid-cols-12 gap-2 items-center p-2 border rounded"
    >
      <div className="col-span-2">
        <Input
          placeholder="Field name"
          value={field.name}
          onChange={(e) =>
            updateField(field.id, "name", e.target.value, isParent)
          }
        />
      </div>
      <div className="col-span-2">
        <Input
          placeholder="Label"
          value={field.label}
          onChange={(e) =>
            updateField(field.id, "label", e.target.value, isParent)
          }
        />
      </div>
      <div className="col-span-2">
        <Select
          value={field.type}
          onValueChange={(value) =>
            updateField(field.id, "type", value, isParent)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fieldTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-1">
        <input
          type="checkbox"
          checked={field.required}
          onChange={(e) =>
            updateField(field.id, "required", e.target.checked, isParent)
          }
          className="w-4 h-4"
        />
      </div>
      <div className="col-span-2">
        <Input
          placeholder="DB Type"
          value={field.dbType}
          onChange={(e) =>
            updateField(field.id, "dbType", e.target.value, isParent)
          }
        />
      </div>
      {field.type === "select" && (
        <div className="col-span-2">
          <Input
            placeholder="Option1, Option2, Option3"
            value={field.selectOptions}
            onChange={(e) =>
              updateField(field.id, "selectOptions", e.target.value, isParent)
            }
          />
        </div>
      )}
      {field.type === "radio" && (
        <div className="col-span-2">
          <Input
            placeholder="Option1, Option2"
            value={field.radioOptions}
            onChange={(e) =>
              updateField(field.id, "radioOptions", e.target.value, isParent)
            }
          />
        </div>
      )}
      {field.type === "boolean" && (
        <div className="col-span-2">
          <Input
            placeholder="Default (true/false)"
            value={field.defaultValue}
            onChange={(e) =>
              updateField(field.id, "defaultValue", e.target.value, isParent)
            }
          />
        </div>
      )}
      {field.type !== "select" &&
        field.type !== "radio" &&
        field.type !== "boolean" && <div className="col-span-2"></div>}
      <div className="col-span-1">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => removeField(field.id, isParent)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Parent Table Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Table Name</Label>
              <Input
                placeholder="users"
                value={parentTable.tableName}
                onChange={(e) =>
                  setParentTable((prev) => ({
                    ...prev,
                    tableName: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label>Entity Name</Label>
              <Input
                placeholder="User"
                value={parentTable.entityName}
                onChange={(e) =>
                  setParentTable((prev) => ({
                    ...prev,
                    entityName: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label>Primary Key Field</Label>
              <Select
                value={parentTable.primaryKey || ""}
                onValueChange={(value) =>
                  setParentTable((prev) => ({
                    ...prev,
                    primaryKey: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select primary key field" />
                </SelectTrigger>
                <SelectContent>
                  {parentTable.fields.length > 0 &&
                    parentTable.fields.map((field) => (
                      <SelectItem key={field.id} value={field.name}>
                        {field.name} ({field.label})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Fields</Label>
              <Button onClick={() => addField(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>

            <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-600 px-2">
              <div className="col-span-2">Name</div>
              <div className="col-span-2">Label</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-1">Required</div>
              <div className="col-span-2">DB Type</div>
              <div className="col-span-2">Options</div>
              <div className="col-span-1">Action</div>
            </div>

            <div className="space-y-2 overflow-y-auto">
              {parentTable.fields.map((field) => renderFieldRow(field, true))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Child Table Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Table Name</Label>
              <Input
                placeholder="user_details"
                value={childTable.tableName}
                onChange={(e) =>
                  setChildTable((prev) => ({
                    ...prev,
                    tableName: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label>Entity Name</Label>
              <Input
                placeholder="UserDetail"
                value={childTable.entityName}
                onChange={(e) =>
                  setChildTable((prev) => ({
                    ...prev,
                    entityName: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label>Primary Key Field</Label>
              <Select
                value={childTable.primaryKey || ""}
                onValueChange={(value) =>
                  setChildTable((prev) => ({
                    ...prev,
                    primaryKey: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select primary key field" />
                </SelectTrigger>
                <SelectContent>
                  {childTable.fields.length > 0 &&
                    childTable.fields.map((field) => (
                      <SelectItem key={field.id} value={field.name}>
                        {field.name} ({field.label})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Foreign Key</Label>
              <Input
                placeholder="user_id"
                value={childTable.foreignKey || ""}
                onChange={(e) =>
                  setChildTable((prev) => ({
                    ...prev,
                    foreignKey: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Fields</Label>
              <Button onClick={() => addField(false)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>

            <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-600 px-2">
              <div className="col-span-2">Name</div>
              <div className="col-span-2">Label</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-1">Required</div>
              <div className="col-span-2">DB Type</div>
              <div className="col-span-2">Options</div>
              <div className="col-span-1">Action</div>
            </div>

            <div className="space-y-2 ">
              {childTable.fields.map((field) => renderFieldRow(field, false))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TableConfiguration;
