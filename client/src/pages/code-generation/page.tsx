import { useState, useEffect,   } from "react";
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
import { Plus, Trash2, Code, Copy, Download, Table } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useGetSchemas, type SchemaType } from "../common-services/useGetSchemas";

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

interface GeneratedCode {
  mainComponent: string;
  addComponent: string;
  listComponent: string;
  queries: string;
  mutations: string;
  backendRoutes: string;
}

interface TableColumn {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string;
}

interface DatabaseTable {
  table_name: string;
}

const CodeGenerationPage = () => {
  const [projectName, setProjectName] = useState("");
  const [entityName, setEntityName] = useState("");
  const [tableName, setTableName] = useState("");
  const [primaryKey, setPrimaryKey] = useState("");
  const [frontendPath, setFrontendPath] = useState("");
  const [backendRoutePath, setBackendRoutePath] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode>({
    mainComponent: "",
    addComponent: "",
    listComponent: "",
    queries: "",
    mutations: "",
    backendRoutes: "",
  });
  const [isReplacing, setIsReplacing] = useState(false);
  const [showGenerated, setShowGenerated] = useState(false);

  const [selectedSchema, setSelectedSchema] = useState("public");
  const [selectedTable, setSelectedTable] = useState("");
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [tableColumns, setTableColumns] = useState<TableColumn[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isLoadingColumns, setIsLoadingColumns] = useState(false);

  const [tableConfig, setTableConfig] = useState<TableConfig>({
    displayFields: [],
    searchableFields: [],
    sortableFields: [],
    defaultSort: "",
    defaultSortOrder: "asc",
    pageSize: 10,
    enableSearch: true,
    enablePagination: true,
  });

  // Load schemas from environment variable or default to "public, sales, hr" using useGetSchemas
  // const schemasEnv = import.meta.env.VITE_DB_SCHEMAS || "public, sales, hr";
  // const availableSchemas = schemasEnv.split(",").map((schema) => schema.trim());
  
  // why schemas not updated

  const { data: schemas } = useGetSchemas();

  useEffect(() => {
    
         console.log("Fetched schemas111:", schemas);
    if (schemas && schemas.length > 0) {
 
      setSelectedSchema(schemas[0].schema_name);
      loadTables(schemas[0].schema_name);
    }
  }, [schemas]);


  // Update table configuration when fields change
  useEffect(() => {
    const displayFields = fields
      .filter((f) => f.displayInTable)
      .map((f) => f.name);
    const searchableFields = fields
      .filter((f) => f.searchable)
      .map((f) => f.name);
    const sortableFields = fields.filter((f) => f.sortable).map((f) => f.name);

    setTableConfig((prev) => ({
      ...prev,
      displayFields,
      searchableFields,
      sortableFields,
      defaultSort:
        prev.defaultSort && sortableFields.includes(prev.defaultSort)
          ? prev.defaultSort
          : sortableFields[0] || "",
    }));
  }, [fields]);

  const loadTables = async (schema: string) => {
    if (!schema) return;

    setIsLoadingTables(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/sys/tables?schema=${schema}`);
      const data = await response.json();
      setTables(data.tables || []);
      setSelectedTable("");
      setTableColumns([]);
    } catch (error) {
      console.error("Error loading tables:", error);
      toast.error("Failed to load tables");
      setTables([]);
    } finally {
      setIsLoadingTables(false);
    }
  };

  const loadTableStructure = async (tableName: string, schema: string) => {
    if (!tableName || !schema) return;

    setIsLoadingColumns(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(
        `${apiUrl}/sys/tables/${tableName}/structure?schema=${schema}`
      );
      const data = await response.json();
      setTableColumns(data.columns || []);
    } catch (error) {
      console.error("Error loading table structure:", error);
      toast.error("Failed to load table structure");
      setTableColumns([]);
    } finally {
      setIsLoadingColumns(false);
    }
  };

  const populateFieldsFromTable = () => {
    if (tableColumns.length === 0) {
      toast.error("No table columns found");
      return;
    }

    const newFields = tableColumns.map((col) => {
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
        displayInTable: true,
        searchable: ["varchar", "text", "char"].some((type) =>
          col.data_type.toLowerCase().includes(type)
        ),
        sortable: true,
      };
    });

    setFields(newFields);

    if (selectedTable && !tableName) {
      setTableName(selectedTable);
    }
    if (selectedTable && !entityName) {
      const cleanEntityName = selectedTable
        .replace(/^(operation_|core_|seed_)/, "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())
        .replace(/\s/g, "");
      setEntityName(cleanEntityName);
    }

    toast.success(`Added ${newFields.length} fields from table structure`);
  };

  useEffect(() => {
    if (selectedSchema) {
      loadTables(selectedSchema);
    }
  }, [selectedSchema]);

  useEffect(() => {
    if (selectedTable && selectedSchema) {
      loadTableStructure(selectedTable, selectedSchema);
    }
  }, [selectedTable, selectedSchema]);

  const replaceAllFiles = async () => {
    if (!entityName || !frontendPath || !backendRoutePath) {
      toast.error("Please provide entity name and file paths");
      return;
    }

    setIsReplacing(true);

    try {
      const payload = {
        entityName,
        tableName,
        frontendPath,
        backendPath: backendRoutePath,
        generatedCode: {
          mainComponent: generatedCode.mainComponent,
          addComponent: generatedCode.addComponent,
          listComponent: generatedCode.listComponent,
          queries: generatedCode.queries,
          mutations: generatedCode.mutations,
          backendRoutes: generatedCode.backendRoutes,
        },
        files: [
          {
            type: "frontend",
            filename: "page.tsx",
            path: `${frontendPath}/${entityName.toLowerCase()}`,
            content: generatedCode.mainComponent,
          },
          {
            type: "frontend",
            filename: `${entityName.toLowerCase()}-form.tsx`,
            path: `${frontendPath}/${entityName.toLowerCase()}/components`,
            content: generatedCode.addComponent,
          },
          {
            type: "frontend",
            filename: `list-${entityName.toLowerCase()}.tsx`,
            path: `${frontendPath}/${entityName.toLowerCase()}/components`,
            content: generatedCode.listComponent,
          },
          {
            type: "frontend",
            filename: "query.ts",
            path: `${frontendPath}/${entityName.toLowerCase()}/service`,
            content: generatedCode.queries,
          },
          {
            type: "frontend",
            filename: "mutation.ts",
            path: `${frontendPath}/${entityName.toLowerCase()}/service`,
            content: generatedCode.mutations,
          },
          {
            type: "backend",
            filename: `${entityName.toLowerCase()}-routes.js`,
            path: backendRoutePath,
            content: generatedCode.backendRoutes,
          },
        ],
      };

      const apiUrl2 =
        import.meta.env.VITE_API_URL_CODEGEN || "http://localhost:5000";

      const response = await fetch(`${apiUrl2}/code-generation/replace-files`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("All files have been successfully replaced!");
      } else {
        toast.error(result.message || "Failed to replace files");
      }
    } catch (error) {
      console.error("Error replacing files:", error);
      toast.error("Failed to replace files. Check your backend connection.");
    } finally {
      setIsReplacing(false);
    }
  };

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

  const addField = () => {
    setFields([
      ...fields,
      {
        id: Date.now(),
        name: "",
        label: "",
        type: "text",
        required: false,
        dbType: "VARCHAR(255)",
        selectOptions: "",
        radioOptions: "",
        defaultValue: "",
        displayInTable: true,
        searchable: true,
        sortable: true,
      },
    ]);
  };

  const updateField = (
    id: number,
    key: keyof Field,
    value: string | boolean | number
  ) => {
    setFields(
      fields.map((field) =>
        field.id === id ? { ...field, [key]: value } : field
      )
    );
  };

  const removeField = (id: number) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const generateZodSchema = () => {
    const schemaFields = fields
      .map((field) => {
        let zodType = "";
        switch (field.type) {
          case "number":
            zodType = `z.number()${
              field.required ? '.min(0, "Must be 0 or greater")' : ".optional()"
            }`;
            break;
          case "email":
            zodType = `z.string()${
              field.required
                ? '.email("Invalid email")'
                : '.email("Invalid email").optional()'
            }`;
            break;
          case "select":
            zodType = `z.coerce.number()${
              field.required
                ? '.min(1, "Selection is required")'
                : ".optional()"
            }`;
            break;
          case "radio":
            zodType = `z.string()${
              field.required
                ? '.min(1, "Selection is required")'
                : ".optional()"
            }`;
            break;
          case "boolean":
            zodType = `z.boolean()${field.required ? "" : ".optional()"}`;
            break;
          default:
            zodType = `z.string()${
              field.required
                ? '.min(1, "' + field.label + ' is required")'
                : ".optional()"
            }`;
        }
        return `  ${field.name}: ${zodType}`;
      })
      .join(",\n");

    return `const ${entityName.toLowerCase()}Schema = z.object({\n${schemaFields}\n});`;
  };

  const generateFormFields = () => {
    return fields
      .map((field) => {
        const fieldName = field.name;
        const fieldLabel = field.label;
        const isRequired = field.required;

        switch (field.type) {
          case "select":
            return `
            <FormField
              control={form.control}
              name="${fieldName}"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    ${fieldLabel} ${
              isRequired ? '<span className="text-red-700">*</span>' : ""
            }
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value ? String(field.value) : undefined}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select ${fieldLabel}" />
                      </SelectTrigger>
                      <SelectContent>
                        ${field.selectOptions
                          .split(",")
                          .map(
                            (option) =>
                              `<SelectItem value="${option.trim()}">${option.trim()}</SelectItem>`
                          )
                          .join("\n                        ")}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />`;
          case "radio":
            return `
            <FormField
              control={form.control}
              name="${fieldName}"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>
                    ${fieldLabel} ${
              isRequired ? '<span className="text-red-700">*</span>' : ""
            }
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-1"
                    >
                      ${field.radioOptions
                        .split(",")
                        .map(
                          (option) =>
                            `<FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="${option.trim()}" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          ${option.trim()}
                        </FormLabel>
                      </FormItem>`
                        )
                        .join("\n                      ")}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />`;
          case "boolean":
            return `
            <FormField
              control={form.control}
              name="${fieldName}"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      ${fieldLabel} ${
              isRequired ? '<span className="text-red-700">*</span>' : ""
            }
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />`;
          case "textarea":
            return `
            <FormField
              control={form.control}
              name="${fieldName}"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    ${fieldLabel} ${
              isRequired ? '<span className="text-red-700">*</span>' : ""
            }
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter ${fieldLabel.toLowerCase()}" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />`;
          case "number":
            return `
            <FormField
              control={form.control}
              name="${fieldName}"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    ${fieldLabel} ${
              isRequired ? '<span className="text-red-700">*</span>' : ""
            }
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />`;
          default:
            return `
            <FormField
              control={form.control}
              name="${fieldName}"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    ${fieldLabel} ${
              isRequired ? '<span className="text-red-700">*</span>' : ""
            }
                  </FormLabel>
                  <FormControl>
                    <Input type="${
                      field.type
                    }" placeholder="Enter ${fieldLabel.toLowerCase()}" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />`;
        }
      })
      .join("\n");
  };

  const generateTableHeaders = () => {
    return fields
      .filter((field) => field.displayInTable)
      .map(
        (field) =>
          `<TableHead className="text-center text-white">${field.label}</TableHead>`
      )
      .join("\n                      ");
  };

  const generateTableCells = () => {
    return fields
      .filter((field) => field.displayInTable)
      .map((field) => {
        if (field.type === "select") {
          return `<TableCell className="text-center">{/* Add select display logic */}</TableCell>`;
        } else if (field.type === "boolean") {
          return `<TableCell className="text-center">
                              <Badge variant={item.${field.name} ? "default" : "secondary"}>
                                {item.${field.name} ? "Yes" : "No"}
                              </Badge>
                            </TableCell>`;
        } else if (field.type === "radio") {
          return `<TableCell className="text-center">
                              <Badge variant="outline">{item.${field.name}}</Badge>
                            </TableCell>`;
        }
        return `<TableCell className="text-center">{item.${field.name}}</TableCell>`;
      })
      .join("\n                            ");
  };

  const generateBackendFields = () => {
    const insertFields = fields.map((f) => f.name).join(", ");
    const insertPlaceholders = fields.map((_, i) => `$${i + 1}`).join(", ");
    const insertValues = fields.map((f) => f.name).join(", ");

    return {
      insertFields: `${insertFields}`,
      insertPlaceholders: `${insertPlaceholders}`,
      insertValues: `${insertValues}`,
      updateFields: fields.map((f, i) => `${f.name} = $${i + 1}`).join(", "),
      updatePlaceholders: fields.map((f) => f.name).join(", "),
    };
  };

  const generateCode = () => {
    const entityLower = entityName.toLowerCase();
    const entityUpper =
      entityName.charAt(0).toUpperCase() + entityName.slice(1);
    const backendFields = generateBackendFields();

    const mainComponent = `"use client";

import React from "react";
import ${entityUpper}Form from "./components/${entityLower}-form";
import List${entityUpper} from "./components/list-${entityLower}";

const ${entityUpper}Page = () => {
  const [formOpen, setFormOpen] = React.useState(false);
  const [editData, setEditData] = React.useState(null);
  
  const handleOpenAdd = () => {
    setEditData(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (data) => {
    setEditData(data);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditData(null);
  };
  
  return (
    <div>
      <${entityUpper}Form 
        open={formOpen} 
        onOpenChange={setFormOpen}
        editData={editData}
        onClose={handleCloseForm}
      />
      <List${entityUpper} 
        onOpenAdd={handleOpenAdd}
        onOpenEdit={handleOpenEdit}
      />
    </div>
  );
};

export default ${entityUpper}Page;`;

    const addComponent = `"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PackagePlus, Edit } from "lucide-react";
import { useAdd${entityUpper}Mutation, useUpdate${entityUpper}Mutation } from "../service/mutation";
import { toast } from "sonner";

${generateZodSchema()}

type ${entityUpper}FormData = z.infer<typeof ${entityLower}Schema>;

interface ${entityUpper}FormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: any;
  onClose: () => void;
}

const ${entityUpper}Form = ({ open, onOpenChange, editData, onClose }: ${entityUpper}FormProps) => {
  const isEditing = !!editData;
  
  const form = useForm<${entityUpper}FormData>({
    resolver: zodResolver(${entityLower}Schema),
    defaultValues: {
      ${fields
        .map((f) => {
          if (f.type === "number") return `${f.name}: 0`;
          if (f.type === "select") return `${f.name}: undefined`;
          if (f.type === "boolean")
            return `${f.name}: ${f.defaultValue === "true"}`;
          if (f.type === "radio") return `${f.name}: ""`;
          return `${f.name}: ""`;
        })
        .join(",\n      ")}
    },
  });

  const { mutate: add${entityUpper}, isPending: isAdding } = useAdd${entityUpper}Mutation();
  const { mutate: update${entityUpper}, isPending: isUpdating } = useUpdate${entityUpper}Mutation();

  // Reset form when dialog opens/closes or editData changes
  useEffect(() => {
    if (open) {
      if (editData) {
        // Populate form with edit data
        form.reset({
          ${fields
            .map((f) => {
              if (f.type === "number")
                return `${f.name}: editData.${f.name} || 0`;
              if (f.type === "select") return `${f.name}: editData.${f.name}`;
              if (f.type === "boolean")
                return `${f.name}: editData.${f.name} || false`;
              return `${f.name}: editData.${f.name} || ""`;
            })
            .join(",\n          ")}
        });
      } else {
        // Reset to default values for add mode
        form.reset({
          ${fields
            .map((f) => {
              if (f.type === "number") return `${f.name}: 0`;
              if (f.type === "select") return `${f.name}: undefined`;
              if (f.type === "boolean")
                return `${f.name}: ${f.defaultValue === "true"}`;
              if (f.type === "radio") return `${f.name}: ""`;
              return `${f.name}: ""`;
            })
            .join(",\n          ")}
        });
      }
    }
  }, [open, editData, form]);

  const onSubmit = async (data: ${entityUpper}FormData) => {
    try {
      const operation = isEditing ? update${entityUpper} : add${entityUpper};
      const operationData = isEditing 
        ? { ...data, item_id: editData.${primaryKey} } 
        : data;

      toast.promise(
        new Promise((resolve, reject) => {
          operation(operationData, {
            onSuccess: () => {
              form.reset();
              onClose();
              resolve(isEditing ? "${entityUpper} updated successfully" : "${entityUpper} added successfully");
            },
            onError: (error) => {
              reject(error.message);
            },
          });
        }),
        {
          loading: isEditing ? "Updating ${entityLower}..." : "Adding ${entityLower}...",
          success: isEditing ? "${entityUpper} updated successfully" : "${entityUpper} added successfully",
          error: isEditing ? "Failed to update ${entityLower}" : "Failed to add ${entityLower}",
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleReset = () => {
    if (isEditing && editData) {
      form.reset({
        ${fields
          .map((f) => {
            if (f.type === "number")
              return `${f.name}: editData.${f.name} || 0`;
            if (f.type === "select") return `${f.name}: editData.${f.name}`;
            if (f.type === "boolean")
              return `${f.name}: editData.${f.name} || false`;
            return `${f.name}: editData.${f.name} || ""`;
          })
          .join(",\n        ")}
      });
    } else {
      form.reset();
    }
  };

  const isPending = isAdding || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <Edit className="w-6 h-6 text-primary" />
              ) : (
                <PackagePlus className="w-6 h-6 text-primary" />
              )}
              <h2 className="text-2xl font-semibold text-primary">
                {isEditing ? "Edit ${entityUpper}" : "Add New ${entityUpper}"}
              </h2>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="bg-white rounded-lg p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${generateFormFields()}
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isPending}
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || isPending}
                >
                  {form.formState.isSubmitting || isPending
                    ? (isEditing ? "Updating..." : "Adding...")
                    : (isEditing ? "Update ${entityUpper}" : "Add ${entityUpper}")}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ${entityUpper}Form;`;

    const listComponent = `import { useState } from "react";
import { useGet${entityUpper} } from "../service/query";
import {
  Package,
  ChevronLeft,
  ChevronRight,
  Trash,
  Edit2,
  Search,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MdAdd } from "react-icons/md";
import { useDelete${entityUpper}Mutation } from "../service/mutation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";

interface List${entityUpper}Props {
  onOpenAdd: () => void;
  onOpenEdit: (data: any) => void;
}

const List${entityUpper} = ({ onOpenAdd, onOpenEdit }: List${entityUpper}Props) => {
  const [page, setPage] = useState(1);
  ${
    tableConfig.enableSearch
      ? 'const [searchTerm, setSearchTerm] = useState("");'
      : ""
  }
  const limit = ${tableConfig.pageSize};

  const { data: ${entityLower}Data } = useGet${entityUpper}(page, limit, ${
      tableConfig.enableSearch ? "searchTerm" : "false"
    });
  const { mutate: delete${entityUpper} } = useDelete${entityUpper}Mutation();
  const totalPages = Math.ceil(${entityLower}Data?.total / limit);

  const handleEdit = (item: any) => {
    onOpenEdit(item);
  };

  const handleDelete = (itemId: string) => {
    toast.promise(
      new Promise<void>((resolve, reject) => {
        delete${entityUpper}(itemId, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      }),
      {
        loading: "Deleting ${entityLower}...",
        success: "${entityUpper} deleted successfully!",
        error: "Failed to delete ${entityLower}",
      }
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-gray-50 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-primary mr-2" />
            <CardTitle className="text-primary">${entityUpper} Items</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            ${
              tableConfig.enableSearch
                ? `
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search ${entityLower}..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>`
                : ""
            }
            <Button variant="outline" onClick={onOpenAdd}>
              <MdAdd className="h-5 w-5 text-primary mr-2" />
              Add ${entityUpper}
            </Button>
          </div>
        </div>
      </CardHeader>
     
      <CardContent className="p-5">
        {${entityLower}Data?.data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Package className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No ${entityLower} items
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first ${entityLower} item.
            </p>
          </div>
        ) : (
          <div className="">
            <Table className="rounded-xl overflow-hidden">
              <TableHeader className="bg-primary">
                <TableRow>
                  ${generateTableHeaders()}
                  <TableHead className="text-center text-white">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-table-body">
                {${entityLower}Data &&
                  ${entityLower}Data?.data?.map((item: any) => {
                    return (
                      <TableRow
                        key={item.${primaryKey}}
                        className="hover:bg-table-body-hover"
                      >
                        ${generateTableCells()}
                        <TableCell className="text-center items-center justify-center flex gap-5">
                          <Edit2
                            className="h-4 w-4 text-blue-600 cursor-pointer hover:text-blue-800"
                            onClick={() => handleEdit(item)}
                          />
                          <Dialog>
                            <DialogTrigger asChild>
                              <Trash className="h-4 w-4 text-red-600 cursor-pointer hover:text-red-800" />
                            </DialogTrigger>
                            <DialogContent>
                              <AlertDialogHeader>
                                <DialogTitle>Are you sure?</DialogTitle>
                                <DialogDescription>
                                  This will permanently delete the
                                  ${entityLower} and its data from the
                                  database.
                                </DialogDescription>
                              </AlertDialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="destructive"
                                  className="cursor-pointer"
                                  onClick={() => handleDelete(item.${primaryKey})}
                                >
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      ${
        tableConfig.enablePagination
          ? `
      <CardFooter className="bg-gray-50">
        <div className="flex justify-between items-center p-4 border-t w-full">
          <Button
            variant="outline"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            onClick={() =>
              setPage((prev) => (prev < totalPages ? prev + 1 : prev))
            }
            disabled={page === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardFooter>`
          : ""
      }
    </Card>
  );
};

export default List${entityUpper};`;

    const queries = `import { useQuery } from "@tanstack/react-query";
import Axios from "axios";

export const useGet${entityUpper} = (
  page: number,
  limit: number,
  ${tableConfig.enableSearch ? "searchTerm?: string," : ""}
  all${entityUpper}?: boolean
) => {
  const apiUrl = import.meta.env.VITE_API_URL;

  return useQuery({
    queryKey: ["${entityLower}", page, limit${
      tableConfig.enableSearch ? ", searchTerm" : ""
    }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        all${entityUpper}: all${entityUpper}?.toString() || 'false',
        ${tableConfig.enableSearch ? 'search: searchTerm || "",' : ""}
      });
      
      const response = await Axios.get(
        \`\${apiUrl}/${entityUpper}/select-all-${entityLower}?\${params}\`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    gcTime: 1000 * 60 * 5,
  });
};`;

    const mutations = `import { useMutation, useQueryClient } from "@tanstack/react-query";
import Axios from "axios";

export const useAdd${entityUpper}Mutation = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: unknown) => {
      const response = await Axios.post(
        \`\${apiUrl}/${entityUpper}/add-${entityLower}\`,
        data,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["${entityLower}"],
      });
    },
  });
};

export const useUpdate${entityUpper}Mutation = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: unknown) => {
      const response = await Axios.put(
        \`\${apiUrl}/${entityUpper}/update-${entityLower}\`,
        data,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["${entityLower}"],
      });
    },
  });
};

export const useDelete${entityUpper}Mutation = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await Axios.delete(
        \`\${apiUrl}/${entityUpper}/delete-${entityLower}/\${id}\`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["${entityLower}"],
      });
    },
  });
};`;

    const backendRoutes = `import express from "express";
const ${entityUpper} = express.Router();

// Add ${entityUpper}
${entityUpper}.post("/add-${entityLower}", async (req, res) => {
  try {
    const pool = req.tenantPool;
    const propertyId = req.propertyId;
    const { ${fields.map((f) => f.name).join(", ")} } = req.body;

    const new${entityUpper} = await pool.query(
      \`INSERT INTO ${tableName} (${backendFields.insertFields})
       VALUES (${backendFields.insertPlaceholders}) RETURNING *\`,
      [${backendFields.insertValues}]
    );

    res.status(201).json({
      success: true,
      data: new${entityUpper}.rows[0],
      message: "${entityUpper} added successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// Update ${entityUpper}
${entityUpper}.put("/update-${entityLower}", async (req, res) => {
  try {
    const pool = req.tenantPool;
    const propertyId = req.propertyId;
    const { ${fields.map((f) => f.name).join(", ")}, item_id } = req.body;

    const updated${entityUpper} = await pool.query(
      \`UPDATE ${tableName} SET ${
      backendFields.updateFields
    } WHERE ${primaryKey} = $${fields.length + 1} RETURNING *\`,
      [${backendFields.updatePlaceholders}, item_id]
    );

    if (updated${entityUpper}.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "${entityUpper} not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updated${entityUpper}.rows[0],
      message: "${entityUpper} updated successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// Delete ${entityUpper}
${entityUpper}.delete("/delete-${entityLower}/:id", async (req, res) => {
  try {
    const pool = req.tenantPool;
    const propertyId = req.propertyId;
    const ${entityLower}Id = req.params.id;

    const deleted${entityUpper} = await pool.query(
      \`DELETE FROM ${tableName} WHERE ${primaryKey} = $1 RETURNING *\`,
      [${entityLower}Id]
    );

    if (deleted${entityUpper}.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "${entityUpper} not found",
      });
    }

    res.status(200).json({
      success: true,
      data: deleted${entityUpper}.rows[0],
      message: "${entityUpper} deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// Get All ${entityUpper}
${entityUpper}.get("/select-all-${entityLower}", async (req, res) => {
  try {
    const pool = req.tenantPool;
    const propertyId = req.propertyId;
    const { page = 1, limit = ${
      tableConfig.pageSize
    }, all${entityUpper} = false${
      tableConfig.enableSearch ? ', search = ""' : ""
    } } = req.query;

    console.log('Pagination params:', { page, limit, all${entityUpper} });

    let query = \`SELECT ${fields
      .filter((f) => f.displayInTable)
      .map((f) => f.name)
      .join(", ")} FROM ${tableName}\`;
    let queryParams = [];
    let countQuery = \`SELECT COUNT(*) FROM ${tableName}\`;
    let countParams = [];

    ${
      tableConfig.enableSearch
        ? `
    // Add search functionality
    if (search && search.trim() !== '') {
      const searchConditions = [${fields
        .filter((f) => f.searchable)
        .map((f, index) => `'${f.name} ILIKE $${index + 1}'`)
        .join(", ")}].join(' OR ');
      const whereClause = \` WHERE (\${searchConditions})\`;
      query += whereClause;
      countQuery += whereClause;
      
      // Add search parameters
      const searchParam = \`%\${search}%\`;
      ${fields
        .filter((f) => f.searchable)
        .map(() => `queryParams.push(searchParam);`)
        .join("\n      ")}
      ${fields
        .filter((f) => f.searchable)
        .map(() => `countParams.push(searchParam);`)
        .join("\n      ")}
    }`
        : ""
    }

    // Always add ORDER BY and pagination unless all${entityUpper} is true
    if (all${entityUpper} !== 'true' && all${entityUpper} !== true) {
      ${
        tableConfig.defaultSort
          ? `query += \` ORDER BY ${
              tableConfig.defaultSort
            } ${tableConfig.defaultSortOrder.toUpperCase()}\`;`
          : "query += ` ORDER BY ${primaryKey} DESC`;"
      }
      ${
        tableConfig.enablePagination
          ? `
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || ${tableConfig.pageSize};
      const offset = (pageNum - 1) * limitNum;
      query += \` LIMIT \${limitNum} OFFSET \${offset}\`;
      console.log('Final query:', query);
      console.log('Page:', pageNum, 'Limit:', limitNum, 'Offset:', offset);`
          : ""
      }
    }

    const result = await pool.query(query, queryParams);
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    console.log('Query result count:', result.rows.length);
    console.log('Total count:', total);

    res.status(200).json({
      success: true,
      data: result.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

export default ${entityUpper}`;

    setGeneratedCode({
      mainComponent,
      addComponent,
      listComponent,
      queries,
      mutations,
      backendRoutes,
    });
    setShowGenerated(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Code copied to clipboard!");
    });
  };

  const downloadFile = (content: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">CRUD Generator</h1>
        <p className="text-gray-600">
          Generate complete CRUD operations for React + Shadcn UI + React Query
          + Express + PostgreSQL
        </p>
      </div>

      {!showGenerated ? (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Database Schema & Table Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="schema">Database Schema</Label>
                  <Select
                    value={selectedSchema}
                    onValueChange={setSelectedSchema}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Schema" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* load schemas */}
                      {schemas && schemas.map((schema: SchemaType) => (
                        <SelectItem key={schema.schema_name} value={schema.schema_name}>
                          {schema.schema_name}
                        </SelectItem>
                      ))}
                      {/* <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="seed">Seed</SelectItem>
                      <SelectItem value="core_data">Core Data</SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="table">Database Table</Label>
                  <Select
                    value={selectedTable}
                    onValueChange={setSelectedTable}
                    disabled={isLoadingTables || tables.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingTables
                            ? "Loading tables..."
                            : tables.length === 0
                            ? "No tables found"
                            : "Select Table"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map((table) => (
                        <SelectItem
                          key={table.table_name}
                          value={table.table_name}
                        >
                          {table.table_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={populateFieldsFromTable}
                    disabled={
                      !selectedTable ||
                      isLoadingColumns ||
                      tableColumns.length === 0
                    }
                    className="w-full"
                    variant="outline"
                  >
                    {isLoadingColumns ? (
                      <>
                        <Code className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Auto-populate Fields
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {tableColumns.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">
                    Table Columns ({tableColumns.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {tableColumns.map((col, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {col.column_name}
                        </Badge>
                        <span className="text-gray-500 text-xs">
                          {col.data_type}
                        </span>
                        {col.is_nullable === "NO" && (
                          <span className="text-red-500 text-xs">*</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Project Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="My Project"
                  />
                </div>
                <div>
                  <Label htmlFor="entityName">Entity Name (PascalCase)</Label>
                  <Input
                    id="entityName"
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                    placeholder="Product"
                  />
                </div>
                <div>
                  <Label htmlFor="tableName">Database Table Name</Label>
                  <Input
                    id="tableName"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="operation_products"
                  />
                </div>
                <div>
                  <Label htmlFor="primaryKey">Primary Key Field</Label>
                  <Select
                    value={primaryKey || ""}
                    onValueChange={(value) => setPrimaryKey(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary key field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">
                        id (Auto-generated Primary Key)
                      </SelectItem>
                      {fields.length > 0 &&
                        fields.map((field) => (
                          <SelectItem key={field.id} value={field.name}>
                            {field.name} ({field.label})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="frontendPath">Frontend Path</Label>
                  <Input
                    id="frontendPath"
                    value={frontendPath}
                    onChange={(e) => setFrontendPath(e.target.value)}
                    placeholder="D:\ceyinfo\Hotel-ERP-Repo\hotel-property-module\src\pages"
                  />
                </div>
                <div>
                  <Label htmlFor="backendPath">Backend Route Path</Label>
                  <Input
                    id="backendPath"
                    value={backendRoutePath}
                    onChange={(e) => setBackendRoutePath(e.target.value)}
                    placeholder="D:\ceyinfo\Hotel-ERP-Repo\x-hotel-erp-backend\routes"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Fields Configuration
                </span>
                <Button onClick={addField} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No fields added yet. Click "Add Field" or use "Auto-populate
                  Fields" to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field) => (
                    <Card key={field.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                        <div>
                          <Label>Field Name</Label>
                          <Input
                            value={field.name}
                            onChange={(e) =>
                              updateField(field.id, "name", e.target.value)
                            }
                            placeholder="fieldName"
                          />
                        </div>
                        <div>
                          <Label>Label</Label>
                          <Input
                            value={field.label}
                            onChange={(e) =>
                              updateField(field.id, "label", e.target.value)
                            }
                            placeholder="Field Label"
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value) =>
                              updateField(field.id, "type", value)
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
                        <div>
                          <Label>DB Type</Label>
                          <Input
                            value={field.dbType}
                            onChange={(e) =>
                              updateField(field.id, "dbType", e.target.value)
                            }
                            placeholder="VARCHAR(255)"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`required-${field.id}`}
                            checked={field.required}
                            onChange={(e) =>
                              updateField(
                                field.id,
                                "required",
                                e.target.checked
                              )
                            }
                            className="rounded"
                          />
                          <Label htmlFor={`required-${field.id}`}>
                            Required
                          </Label>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeField(field.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {field.type === "select" && (
                        <div className="mt-4">
                          <Label>Select Options (comma-separated)</Label>
                          <Input
                            value={field.selectOptions}
                            onChange={(e) =>
                              updateField(
                                field.id,
                                "selectOptions",
                                e.target.value
                              )
                            }
                            placeholder="Option1, Option2, Option3"
                          />
                        </div>
                      )}
                      {field.type === "radio" && (
                        <div className="mt-4">
                          <Label>Radio Options (comma-separated)</Label>
                          <Input
                            value={field.radioOptions}
                            onChange={(e) =>
                              updateField(
                                field.id,
                                "radioOptions",
                                e.target.value
                              )
                            }
                            placeholder="Active, Inactive"
                          />
                        </div>
                      )}
                      {field.type === "boolean" && (
                        <div className="mt-4">
                          <Label>Default Value</Label>
                          <Select
                            value={field.defaultValue}
                            onValueChange={(value) =>
                              updateField(field.id, "defaultValue", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select default value" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">True</SelectItem>
                              <SelectItem value="false">False</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Table Configuration Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Table className="h-5 w-5" />
                  Table Configuration
                </span>
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
                        id={`display-${field.id}`}
                        checked={field.displayInTable}
                        onChange={(e) =>
                          updateField(
                            field.id,
                            "displayInTable",
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-300"
                      />
                      <label
                        htmlFor={`display-${field.id}`}
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
                        id={`search-${field.id}`}
                        checked={field.searchable}
                        onChange={(e) =>
                          updateField(field.id, "searchable", e.target.checked)
                        }
                        className="rounded border-gray-300"
                      />
                      <label
                        htmlFor={`search-${field.id}`}
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
                        id={`sort-${field.id}`}
                        checked={field.sortable}
                        onChange={(e) =>
                          updateField(field.id, "sortable", e.target.checked)
                        }
                        className="rounded border-gray-300"
                      />
                      <label
                        htmlFor={`sort-${field.id}`}
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
                      setTableConfig({
                        ...tableConfig,
                        defaultSort: e.target.value,
                      })
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
                      id="enable-search"
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
                      htmlFor="enable-search"
                      className="text-sm text-gray-700"
                    >
                      Enable Search
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="enable-pagination"
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
                      htmlFor="enable-pagination"
                      className="text-sm text-gray-700"
                    >
                      Enable Pagination
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              onClick={generateCode}
              size="lg"
              disabled={
                !entityName || !tableName || fields.length === 0 || !primaryKey
              }
              className="px-8"
            >
              <Code className="h-5 w-5 mr-2" />
              Generate CRUD Code
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Generated Code</h2>
            <div className="flex gap-3">
              <Button
                onClick={replaceAllFiles}
                disabled={isReplacing || !frontendPath || !backendRoutePath}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isReplacing ? (
                  <>
                    <Code className="h-4 w-4 mr-2 animate-spin" />
                    Replacing Files...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Replace All Files
                  </>
                )}
              </Button>
              <Button onClick={() => setShowGenerated(false)} variant="outline">
                Back to Configuration
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">File Replacement Paths</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-green-700">
                    Frontend Path:
                  </Label>
                  <div className="p-3 bg-green-50 rounded-lg border">
                    <code className="text-sm text-green-800">
                      {frontendPath || "Not specified"}
                    </code>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-blue-700">
                    Backend Path:
                  </Label>
                  <div className="p-3 bg-blue-50 rounded-lg border">
                    <code className="text-sm text-blue-800">
                      {backendRoutePath || "Not specified"}
                    </code>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">
                  📁 Files that will be created/replaced:
                </h4>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="space-y-1 text-green-700">
                    <div>
                      • {frontendPath}/{entityName.toLowerCase() || "entity"}
                      /page.tsx
                    </div>
                    <div>
                      • {frontendPath}/{entityName.toLowerCase() || "entity"}
                      /components/{entityName.toLowerCase() || "entity"}
                      -form.tsx
                    </div>
                    <div>
                      • {frontendPath}/{entityName.toLowerCase() || "entity"}
                      /components/list-{entityName.toLowerCase() || "entity"}
                      .tsx
                    </div>
                    <div>
                      • {frontendPath}/{entityName.toLowerCase() || "entity"}
                      /service/query.ts
                    </div>
                    <div>
                      • {frontendPath}/{entityName.toLowerCase() || "entity"}
                      /service/mutation.ts
                    </div>
                  </div>
                  <div className="space-y-1 text-blue-700">
                    <div>
                      • {backendRoutePath}/
                      {entityName.toLowerCase() || "entity"}-routes.js
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="main" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="main">Main Page</TabsTrigger>
              <TabsTrigger value="form">Form Component</TabsTrigger>
              <TabsTrigger value="list">List Component</TabsTrigger>
              <TabsTrigger value="queries">Queries</TabsTrigger>
              <TabsTrigger value="mutations">Mutations</TabsTrigger>
              <TabsTrigger value="backend">Backend Routes</TabsTrigger>
            </TabsList>

            {Object.entries({
              main: { code: generatedCode.mainComponent, filename: `page.tsx` },
              form: {
                code: generatedCode.addComponent,
                filename: `${entityName.toLowerCase()}-form.tsx`,
              },
              list: {
                code: generatedCode.listComponent,
                filename: `list-${entityName.toLowerCase()}.tsx`,
              },
              queries: { code: generatedCode.queries, filename: "query.ts" },
              mutations: {
                code: generatedCode.mutations,
                filename: "mutation.ts",
              },
              backend: {
                code: generatedCode.backendRoutes,
                filename: `${entityName.toLowerCase()}-routes.js`,
              },
            }).map(([key, { code, filename }]) => (
              <TabsContent key={key} value={key} className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{filename}</Badge>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(code)}
                      size="sm"
                      variant="outline"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => downloadFile(code, filename)}
                      size="sm"
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-96 overflow-y-auto">
                    <code>{code}</code>
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default CodeGenerationPage;
