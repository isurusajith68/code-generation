import { useState, useEffect } from "react";
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
import { Plus, Trash2, Code, Copy, Download, Eye, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

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

interface GeneratedCode {
  mainComponent: string;
  addComponent: string;
  listComponent: string;
  detailsComponent: string;
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

const MasterDetailCodeGenerationPage = () => {
  const [projectName, setProjectName] = useState("");
  const [frontendPath, setFrontendPath] = useState("");
  const [backendRoutePath, setBackendRoutePath] = useState("");

  const [parentTable, setParentTable] = useState<TableInfo>({
    tableName: "",
    entityName: "",
    fields: [],
  });

  // Child table state
  const [childTable, setChildTable] = useState<TableInfo>({
    tableName: "",
    entityName: "",
    fields: [],
    foreignKey: "",
  });

  const [generatedCode, setGeneratedCode] = useState<GeneratedCode>({
    mainComponent: "",
    addComponent: "",
    listComponent: "",
    detailsComponent: "",
    queries: "",
    mutations: "",
    backendRoutes: "",
  });

  const [isReplacing, setIsReplacing] = useState(false);
  const [showGenerated, setShowGenerated] = useState(false);

  // Database interaction state
  const [selectedSchema, setSelectedSchema] = useState("public");
  const [selectedParentTable, setSelectedParentTable] = useState("");
  const [selectedChildTable, setSelectedChildTable] = useState("");
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [parentColumns, setParentColumns] = useState<TableColumn[]>([]);
  const [childColumns, setChildColumns] = useState<TableColumn[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isLoadingParentColumns, setIsLoadingParentColumns] = useState(false);
  const [isLoadingChildColumns, setIsLoadingChildColumns] = useState(false);

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

    const newFields = columns
      .filter((col) => !excludeColumns.includes(col.column_name.toLowerCase()))
      .map((col) => {
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
    value: any,
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

  const generateZodSchema = (fields: Field[], entityName: string) => {
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

  const generateFormFields = (fields: Field[]) => {
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

  const generateTableHeaders = (fields: Field[]) => {
    return fields
      .map(
        (field) =>
          `<TableHead className="text-center text-white">${field.label}</TableHead>`
      )
      .join("\n                      ");
  };

  const generateTableCells = (fields: Field[]) => {
    return fields
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

  const generateCode = () => {
    const parentEntityLower = parentTable.entityName.toLowerCase();
    const parentEntityUpper =
      parentTable.entityName.charAt(0).toUpperCase() +
      parentTable.entityName.slice(1);
    const childEntityLower = childTable.entityName.toLowerCase();
    const childEntityUpper =
      childTable.entityName.charAt(0).toUpperCase() +
      childTable.entityName.slice(1);

    const mainComponent = `"use client";

import React from "react";
import Add${parentEntityUpper} from "./components/add-${parentEntityLower}";
import List${parentEntityUpper} from "./components/list-${parentEntityLower}";
import ${parentEntityUpper}Details from "./components/${parentEntityLower}-details";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PackagePlus } from "lucide-react";

const ${parentEntityUpper}Page = () => {
  const [open, setOpen] = React.useState(false);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [selectedParentId, setSelectedParentId] = React.useState<number | null>(null);
  
  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen} modal={true}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-6">
              <PackagePlus className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-primary">
                Add New ${parentEntityUpper}
              </h2>
            </div>
          </DialogHeader>
          <Add${parentEntityUpper} setOpen={setOpen} />
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen} modal={true}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-6">
              <Eye className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-primary">
                ${parentEntityUpper} Details
              </h2>
            </div>
          </DialogHeader>
          {selectedParentId && (
            <${parentEntityUpper}Details 
              parentId={selectedParentId} 
              setOpen={setDetailsOpen} 
            />
          )}
        </DialogContent>
      </Dialog>

      <List${parentEntityUpper} 
        setOpen={setOpen} 
        setDetailsOpen={setDetailsOpen}
        setSelectedParentId={setSelectedParentId}
      />
    </div>
  );
};

export default ${parentEntityUpper}Page;`;

    const addComponent = `"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { useAdd${parentEntityUpper}Mutation } from "../service/mutation";
import { toast } from "sonner";

${generateZodSchema(parentTable.fields, parentTable.entityName)}

${generateZodSchema(childTable.fields, childTable.entityName)}

const masterDetailSchema = z.object({
  ${parentEntityLower}: ${parentTable.entityName.toLowerCase()}Schema,
  ${childEntityLower}Items: z.array(${childTable.entityName.toLowerCase()}Schema).min(1, "At least one ${childEntityLower} item is required"),
});

type MasterDetailFormData = z.infer<typeof masterDetailSchema>;

const Add${parentEntityUpper} = ({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const form = useForm<MasterDetailFormData>({
    resolver: zodResolver(masterDetailSchema),
    defaultValues: {
      ${parentEntityLower}: {
        ${parentTable.fields
          .map((f) => {
            if (f.type === "number") return `${f.name}: 0`;
            if (f.type === "select") return `${f.name}: undefined`;
            if (f.type === "boolean")
              return `${f.name}: ${f.defaultValue === "true"}`;
            if (f.type === "radio") return `${f.name}: ""`;
            return `${f.name}: ""`;
          })
          .join(",\n        ")}
      },
      ${childEntityLower}Items: [{
        ${childTable.fields
          .map((f) => {
            if (f.type === "number") return `${f.name}: 0`;
            if (f.type === "select") return `${f.name}: undefined`;
            if (f.type === "boolean")
              return `${f.name}: ${f.defaultValue === "true"}`;
            if (f.type === "radio") return `${f.name}: ""`;
            return `${f.name}: ""`;
          })
          .join(",\n        ")}
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "${childEntityLower}Items",
  });

  const { mutate: add${parentEntityUpper}, isPending } = useAdd${parentEntityUpper}Mutation();

  const onSubmit = async (data: MasterDetailFormData) => {
    try {
      toast.promise(
        new Promise((resolve, reject) => {
          add${parentEntityUpper}(data, {
            onSuccess: () => {
              form.reset();
              resolve("${parentEntityUpper} added successfully");
              setOpen(false);
            },
            onError: (error) => {
              reject(error.message);
            },
          });
        }),
        {
          loading: "Adding ${parentEntityLower}...",
          success: "${parentEntityUpper} added successfully",
          error: "Failed to add ${parentEntityLower}",
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const addDetailItem = () => {
    append({
      ${childTable.fields
        .map((f) => {
          if (f.type === "number") return `${f.name}: 0`;
          if (f.type === "select") return `${f.name}: undefined`;
          if (f.type === "boolean")
            return `${f.name}: ${f.defaultValue === "true"}`;
          if (f.type === "radio") return `${f.name}: ""`;
          return `${f.name}: ""`;
        })
        .join(",\n      ")}
    });
  };

  return (
    <div className="bg-white rounded-lg p-0">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Parent Form */}
          <Card>
            <CardHeader>
              <CardTitle>${parentEntityUpper} Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${generateFormFields(parentTable.fields).replace(
                  /name="/g,
                  `name="${parentEntityLower}.`
                )}
              </div>
            </CardContent>
          </Card>

          {/* Child Items Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>${childEntityUpper} Items</CardTitle>
              <Button type="button" onClick={addDetailItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add ${childEntityUpper}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      ${childTable.fields
                        .map((field) => `<TableHead>${field.label}</TableHead>`)
                        .join("\n                      ")}
                      <TableHead className="w-[50px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        ${childTable.fields
                          .map((f, fieldIndex) => {
                            if (f.type === "boolean") {
                              return `<TableCell>
                          <FormField
                            control={form.control}
                            name={\`${childEntityLower}Items.\${index}.${f.name}\`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>`;
                            } else if (f.type === "select") {
                              return `<TableCell>
                          <FormField
                            control={form.control}
                            name={\`${childEntityLower}Items.\${index}.${
                                f.name
                              }\`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      ${f.selectOptions
                                        .split(",")
                                        .map(
                                          (option) =>
                                            `<SelectItem value="${option.trim()}">${option.trim()}</SelectItem>`
                                        )
                                        .join(
                                          "\n                                      "
                                        )}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>`;
                            } else if (f.type === "radio") {
                              return `<TableCell>
                          <FormField
                            control={form.control}
                            name={\`${childEntityLower}Items.\${index}.${
                                f.name
                              }\`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      ${f.radioOptions
                                        .split(",")
                                        .map(
                                          (option) =>
                                            `<SelectItem value="${option.trim()}">${option.trim()}</SelectItem>`
                                        )
                                        .join(
                                          "\n                                      "
                                        )}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>`;
                            } else if (f.type === "textarea") {
                              return `<TableCell>
                          <FormField
                            control={form.control}
                            name={\`${childEntityLower}Items.\${index}.${
                                f.name
                              }\`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Enter ${f.label.toLowerCase()}" 
                                    className="min-w-[150px]"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>`;
                            } else if (f.type === "number") {
                              return `<TableCell>
                          <FormField
                            control={form.control}
                            name={\`${childEntityLower}Items.\${index}.${f.name}\`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    className="min-w-[100px]"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>`;
                            } else {
                              return `<TableCell>
                          <FormField
                            control={form.control}
                            name={\`${childEntityLower}Items.\${index}.${
                                f.name
                              }\`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="${f.type}"
                                    placeholder="Enter ${f.label.toLowerCase()}"
                                    className="min-w-[120px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>`;
                            }
                          })
                          .join("\n                        ")}
                        <TableCell>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {fields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No ${childEntityLower} items added. Click "Add ${childEntityUpper}" to get started.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              className="cursor-pointer"
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button
              className="cursor-pointer"
              type="submit"
              disabled={form.formState.isSubmitting || isPending}
            >
              {form.formState.isSubmitting || isPending
                ? "Adding..."
                : "Add ${parentEntityUpper}"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Add${parentEntityUpper};`;

    const listComponent = `import { useState } from "react";
import { useGet${parentEntityUpper} } from "../service/query";
import {
  Package,
  ChevronLeft,
  ChevronRight,
  Trash,
  Edit2,
  Eye,
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
import { MdAdd } from "react-icons/md";
import {
  useDelete${parentEntityUpper}Mutation,
} from "../service/mutation";
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

interface List${parentEntityUpper}Props {
  setOpen: (open: boolean) => void;
  setDetailsOpen: (open: boolean) => void;
  setSelectedParentId: (id: number) => void;
}

const List${parentEntityUpper} = ({ setOpen, setDetailsOpen, setSelectedParentId }: List${parentEntityUpper}Props) => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: ${parentEntityLower}Data } = useGet${parentEntityUpper}(page, limit, false);
  const { mutate: delete${parentEntityUpper} } = useDelete${parentEntityUpper}Mutation();
  const totalPages = Math.ceil(${parentEntityLower}Data?.total / limit);

  const handleViewDetails = (parentId: number) => {
    setSelectedParentId(parentId);
    setDetailsOpen(true);
  };

  const handleDelete = (itemId: number) => {
    toast.promise(
      new Promise<void>((resolve, reject) => {
        delete${parentEntityUpper}(itemId, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      }),
      {
        loading: "Deleting ${parentEntityLower}...",
        success: "${parentEntityUpper} deleted successfully!",
        error: "Failed to delete ${parentEntityLower}",
      }
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-gray-50 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-primary mr-2" />
            <CardTitle className="text-primary">${parentEntityUpper} Items</CardTitle>
          </div>
          <div>
            <Button variant="outline" onClick={() => setOpen(true)}>
              <MdAdd className="h-5 w-5 text-primary mr-2" />
              Add ${parentEntityUpper}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        {${parentEntityLower}Data?.data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Package className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No ${parentEntityLower} items
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first ${parentEntityLower} item.
            </p>
          </div>
        ) : (
          <div className="">
            <Table className="rounded-xl overflow-hidden">
              <TableHeader className="bg-primary">
                <TableRow>
                  ${generateTableHeaders(parentTable.fields)}
                  <TableHead className="text-center text-white">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-table-body">
                {${parentEntityLower}Data &&
                  ${parentEntityLower}Data?.data?.map((item) => {
                    return (
                      <TableRow
                        key={item.id}
                        className="hover:bg-table-body-hover"
                      >
                        ${generateTableCells(parentTable.fields)}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(item.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <AlertDialogHeader>
                                  <DialogTitle>Are you sure?</DialogTitle>
                                  <DialogDescription>
                                    This will permanently delete the
                                    ${parentEntityLower} and all its ${childEntityLower} items from the
                                    database.
                                  </DialogDescription>
                                </AlertDialogHeader>
                                <DialogFooter>
                                  <Button
                                    variant="destructive"
                                    className="cursor-pointer"
                                    onClick={() => handleDelete(item.id)}
                                  >
                                    Delete
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
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
      </CardFooter>
    </Card>
  );
};

export default List${parentEntityUpper};`;

    const detailsComponent = `import { useState } from "react";
import { useGet${parentEntityUpper}Details, useGet${childEntityUpper}ByParent } from "../service/query";
import { useAdd${childEntityUpper}Mutation, useUpdate${childEntityUpper}Mutation, useDelete${childEntityUpper}Mutation } from "../service/mutation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Plus, Edit2, Trash, Save, X } from "lucide-react";
import { toast } from "sonner";

interface ${parentEntityUpper}DetailsProps {
  parentId: number;
  setOpen: (open: boolean) => void;
}

const ${parentEntityUpper}Details = ({ parentId, setOpen }: ${parentEntityUpper}DetailsProps) => {
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [newItem, setNewItem] = useState<any>({
    ${childTable.fields
      .map((f) => {
        if (f.type === "number") return `${f.name}: 0`;
        if (f.type === "boolean") return `${f.name}: false`;
        return `${f.name}: ""`;
      })
      .join(",\n    ")}
  });
  const [editingData, setEditingData] = useState<any>({});

  const { data: parentData } = useGet${parentEntityUpper}Details(parentId);
  const { data: childData } = useGet${childEntityUpper}ByParent(parentId);
  const { mutate: add${childEntityUpper} } = useAdd${childEntityUpper}Mutation();
  const { mutate: update${childEntityUpper} } = useUpdate${childEntityUpper}Mutation();
  const { mutate: delete${childEntityUpper} } = useDelete${childEntityUpper}Mutation();

  const handleAddItem = () => {
    const itemToAdd = {
      ...newItem,
      ${childTable.foreignKey}: parentId
    };

    toast.promise(
      new Promise<void>((resolve, reject) => {
        add${childEntityUpper}(itemToAdd, {
          onSuccess: () => {
            setNewItem({
              ${childTable.fields
                .map((f) => {
                  if (f.type === "number") return `${f.name}: 0`;
                  if (f.type === "boolean") return `${f.name}: false`;
                  return `${f.name}: ""`;
                })
                .join(",\n              ")}
            });
            resolve();
          },
          onError: (error) => reject(error),
        });
      }),
      {
        loading: "Adding ${childEntityLower}...",
        success: "${childEntityUpper} added successfully!",
        error: "Failed to add ${childEntityLower}",
      }
    );
  };

  const handleEditStart = (item: any) => {
    setEditingItem(item.id);
    setEditingData({ ...item });
  };

  const handleEditSave = () => {
    toast.promise(
      new Promise<void>((resolve, reject) => {
        update${childEntityUpper}(editingData, {
          onSuccess: () => {
            setEditingItem(null);
            setEditingData({});
            resolve();
          },
          onError: (error) => reject(error),
        });
      }),
      {
        loading: "Updating ${childEntityLower}...",
        success: "${childEntityUpper} updated successfully!",
        error: "Failed to update ${childEntityLower}",
      }
    );
  };

  const handleEditCancel = () => {
    setEditingItem(null);
    setEditingData({});
  };

  const handleDelete = (itemId: number) => {
    toast.promise(
      new Promise<void>((resolve, reject) => {
        delete${childEntityUpper}(itemId, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      }),
      {
        loading: "Deleting ${childEntityLower}...",
        success: "${childEntityUpper} deleted successfully!",
        error: "Failed to delete ${childEntityLower}",
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Parent Details */}
      <Card>
        <CardHeader>
          <CardTitle>${parentEntityUpper} Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${parentTable.fields
              .map(
                (field) => `
            <div>
              <Label className="font-medium">${field.label}</Label>
              <p className="text-sm text-gray-600 mt-1">
                {parentData?.${field.name}}
              </p>
            </div>`
              )
              .join("")}
          </div>
        </CardContent>
      </Card>

      {/* Child Items */}
      <Card>
        <CardHeader>
          <CardTitle>${childEntityUpper} Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Item Form */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-lg">Add New ${childEntityUpper}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${childTable.fields
                  .map((field) => {
                    if (field.type === "boolean") {
                      return `
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <Label>${field.label}</Label>
                  <Switch
                    checked={newItem.${field.name}}
                    onCheckedChange={(checked) => setNewItem(prev => ({...prev, ${field.name}: checked}))}
                  />
                </div>`;
                    } else if (field.type === "textarea") {
                      return `
                <div>
                  <Label>${field.label}</Label>
                  <Textarea
                    value={newItem.${field.name}}
                    onChange={(e) => setNewItem(prev => ({...prev, ${
                      field.name
                    }: e.target.value}))}
                    placeholder="Enter ${field.label.toLowerCase()}"
                  />
                </div>`;
                    } else {
                      return `
                <div>
                  <Label>${field.label}</Label>
                  <Input
                    type="${field.type === "number" ? "number" : "text"}"
                    value={newItem.${field.name}}
                    onChange={(e) => setNewItem(prev => ({...prev, ${
                      field.name
                    }: ${
                        field.type === "number"
                          ? "Number(e.target.value)"
                          : "e.target.value"
                      }}))}
                    placeholder="Enter ${field.label.toLowerCase()}"
                  />
                </div>`;
                    }
                  })
                  .join("")}
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handleAddItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add ${childEntityUpper}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Child Items Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  ${generateTableHeaders(childTable.fields)}
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {childData?.data?.map((item) => (
                  <TableRow key={item.id}>
                    ${childTable.fields
                      .map((field) => {
                        if (field.type === "boolean") {
                          return `
                    <TableCell className="text-center">
                      {editingItem === item.id ? (
                        <Switch
                          checked={editingData.${field.name}}
                          onCheckedChange={(checked) => setEditingData(prev => ({...prev, ${field.name}: checked}))}
                        />
                      ) : (
                        <Badge variant={item.${field.name} ? "default" : "secondary"}>
                          {item.${field.name} ? "Yes" : "No"}
                        </Badge>
                      )}
                    </TableCell>`;
                        } else if (field.type === "radio") {
                          return `
                    <TableCell className="text-center">
                      {editingItem === item.id ? (
                        <Select
                          value={editingData.${field.name}}
                          onValueChange={(value) => setEditingData(prev => ({...prev, ${
                            field.name
                          }: value}))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            ${field.radioOptions
                              .split(",")
                              .map(
                                (option) =>
                                  `<SelectItem value="${option.trim()}">${option.trim()}</SelectItem>`
                              )
                              .join("\n                            ")}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline">{item.${field.name}}</Badge>
                      )}
                    </TableCell>`;
                        } else {
                          return `
                    <TableCell className="text-center">
                      {editingItem === item.id ? (
                        <Input
                          type="${field.type === "number" ? "number" : "text"}"
                          value={editingData.${field.name}}
                          onChange={(e) => setEditingData(prev => ({...prev, ${
                            field.name
                          }: ${
                            field.type === "number"
                              ? "Number(e.target.value)"
                              : "e.target.value"
                          }}))}
                        />
                      ) : (
                        item.${field.name}
                      )}
                    </TableCell>`;
                        }
                      })
                      .join("")}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {editingItem === item.id ? (
                          <>
                            <Button size="sm" onClick={handleEditSave}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleEditCancel}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleEditStart(item)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <AlertDialogHeader>
                                  <DialogTitle>Are you sure?</DialogTitle>
                                  <DialogDescription>
                                    This will permanently delete this ${childEntityLower} item.
                                  </DialogDescription>
                                </AlertDialogHeader>
                                <DialogFooter>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(item.id)}
                                  >
                                    Delete
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ${parentEntityUpper}Details;`;

    const queries = `import { useQuery } from "@tanstack/react-query";
import Axios from "axios";

export const useGet${parentEntityUpper} = (
  page: number,
  limit: number,
  all${parentEntityUpper}?: boolean
) => {
  const apiUrl = import.meta.env.VITE_API_URL;

  return useQuery({
    queryKey: ["${parentEntityLower}", page, limit],
    queryFn: async () => {
      const response = await Axios.get(
        \`\${apiUrl}/${parentEntityUpper}/select-all-${parentEntityLower}?page=\${page}&limit=\${limit}&all${parentEntityUpper}=\${all${parentEntityUpper}}\`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    gcTime: 1000 * 60 * 5,
  });
};

export const useGet${parentEntityUpper}Details = (parentId: number) => {
  const apiUrl = import.meta.env.VITE_API_URL;

  return useQuery({
    queryKey: ["${parentEntityLower}", parentId],
    queryFn: async () => {
      const response = await Axios.get(
        \`\${apiUrl}/${parentEntityUpper}/get-${parentEntityLower}/\${parentId}\`,
        {
          withCredentials: true,
        }
      );
      return response.data.data;
    },
    enabled: !!parentId,
    gcTime: 1000 * 60 * 5,
  });
};

export const useGet${childEntityUpper}ByParent = (parentId: number) => {
  const apiUrl = import.meta.env.VITE_API_URL;

  return useQuery({
    queryKey: ["${childEntityLower}", "parent", parentId],
    queryFn: async () => {
      const response = await Axios.get(
        \`\${apiUrl}/${childEntityUpper}/get-by-parent/\${parentId}\`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    enabled: !!parentId,
    gcTime: 1000 * 60 * 5,
  });
};`;

    const mutations = `import { useMutation, useQueryClient } from "@tanstack/react-query";
import Axios from "axios";

export const useAdd${parentEntityUpper}Mutation = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: unknown) => {
      const response = await Axios.post(
        \`\${apiUrl}/${parentEntityUpper}/add-${parentEntityLower}-with-details\`,
        data,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["${parentEntityLower}"],
      });
    },
  });
};

export const useUpdate${parentEntityUpper}Mutation = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: unknown) => {
      const response = await Axios.put(
        \`\${apiUrl}/${parentEntityUpper}/update-${parentEntityLower}\`,
        data,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["${parentEntityLower}"],
      });
    },
  });
};

export const useDelete${parentEntityUpper}Mutation = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await Axios.delete(
        \`\${apiUrl}/${parentEntityUpper}/delete-${parentEntityLower}/\${id}\`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["${parentEntityLower}"],
      });
    },
  });
};

export const useAdd${childEntityUpper}Mutation = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: unknown) => {
      const response = await Axios.post(
        \`\${apiUrl}/${childEntityUpper}/add-${childEntityLower}\`,
        data,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["${childEntityLower}"],
      });
    },
  });
};

export const useUpdate${childEntityUpper}Mutation = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: unknown) => {
      const response = await Axios.put(
        \`\${apiUrl}/${childEntityUpper}/update-${childEntityLower}\`,
        data,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["${childEntityLower}"],
      });
    },
  });
};

export const useDelete${childEntityUpper}Mutation = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await Axios.delete(
        \`\${apiUrl}/${childEntityUpper}/delete-${childEntityLower}/\${id}\`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["${childEntityLower}"],
      });
    },
  });
};`;

    const backendRoutes = `import express from "express";
const ${parentEntityUpper} = express.Router();

// Add ${parentEntityUpper} with ${childEntityUpper} items
${parentEntityUpper}.post("/add-${parentEntityLower}-with-details", async (req, res) => {
  const client = req.tenantPool;
  
  try {
    await client.query('BEGIN');
    
    const { ${parentEntityLower}, ${childEntityLower}Items } = req.body;
    const { ${parentTable.fields
      .map((f) => f.name)
      .join(", ")} } = ${parentEntityLower};

    // Insert parent record
    const parentResult = await client.query(
      \`INSERT INTO ${parentTable.tableName} (${parentTable.fields
      .map((f) => f.name)
      .join(", ")})
       VALUES (${parentTable.fields
         .map((_, i) => `${i + 1}`)
         .join(", ")}) RETURNING *\`,
      [${parentTable.fields.map((f) => f.name).join(", ")}]
    );

    const parentId = parentResult.rows[0].id;

    // Insert child records
    for (const item of ${childEntityLower}Items) {
      const { ${childTable.fields.map((f) => f.name).join(", ")} } = item;
      
      await client.query(
        \`INSERT INTO ${childTable.tableName} (${childTable.fields
      .map((f) => f.name)
      .join(", ")}, ${childTable.foreignKey})
         VALUES (${childTable.fields.map((_, i) => `${i + 1}`).join(", ")}, ${
      childTable.fields.length + 1
    })\`,
        [${childTable.fields.map((f) => f.name).join(", ")}, parentId]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: parentResult.rows[0],
      message: "${parentEntityUpper} with details added successfully",
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// Get all ${parentEntityUpper} records
${parentEntityUpper}.get("/select-all-${parentEntityLower}", async (req, res) => {
  try {
    const pool = req.tenantPool;
    const { page = 1, limit = 10, all${parentEntityUpper} = false } = req.query;

    let query = \`SELECT * FROM ${parentTable.tableName}\`;
    let queryParams = [];

    if (!all${parentEntityUpper}) {
      const offset = (page - 1) * limit;
      query += \` ORDER BY createdate DESC LIMIT $1 OFFSET $2\`;
      queryParams.push(limit, offset);
    }

    const result = await pool.query(query, queryParams);

    // Get total count for pagination
    const countResult = await pool.query(
      \`SELECT COUNT(*) FROM ${parentTable.tableName}\`
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// Get single ${parentEntityUpper} record
${parentEntityUpper}.get("/get-${parentEntityLower}/:id", async (req, res) => {
  try {
    const pool = req.tenantPool;
    const ${parentEntityLower}Id = req.params.id;

    const result = await pool.query(
      \`SELECT * FROM ${parentTable.tableName} WHERE id = $1\`,
      [${parentEntityLower}Id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "${parentEntityUpper} not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// Delete ${parentEntityUpper} with all child records
${parentEntityUpper}.delete("/delete-${parentEntityLower}/:id", async (req, res) => {
  const client = req.tenantPool;
  
  try {
    await client.query('BEGIN');
    
    const ${parentEntityLower}Id = req.params.id;

    // Delete child records first
    await client.query(
      \`DELETE FROM ${childTable.tableName} WHERE ${
      childTable.foreignKey
    } = $1\`,
      [${parentEntityLower}Id]
    );

    // Delete parent record
    const deleted${parentEntityUpper} = await client.query(
      \`DELETE FROM ${parentTable.tableName} WHERE id = $1 RETURNING *\`,
      [${parentEntityLower}Id]
    );

    if (deleted${parentEntityUpper}.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: "${parentEntityUpper} not found",
      });
    }

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      data: deleted${parentEntityUpper}.rows[0],
      message: "${parentEntityUpper} deleted successfully",
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// ${childEntityUpper} routes
const ${childEntityUpper}Router = express.Router();

// Add ${childEntityUpper}
${childEntityUpper}Router.post("/add-${childEntityLower}", async (req, res) => {
  try {
    const pool = req.tenantPool;
    const { ${childTable.fields.map((f) => f.name).join(", ")}, ${
      childTable.foreignKey
    } } = req.body;

    const new${childEntityUpper} = await pool.query(
      \`INSERT INTO ${childTable.tableName} (${childTable.fields
      .map((f) => f.name)
      .join(", ")}, ${childTable.foreignKey})
       VALUES (${childTable.fields.map((_, i) => `${i + 1}`).join(", ")}, ${
      childTable.fields.length + 1
    }) RETURNING *\`,
      [${childTable.fields.map((f) => f.name).join(", ")}, ${
      childTable.foreignKey
    }]
    );

    res.status(201).json({
      success: true,
      data: new${childEntityUpper}.rows[0],
      message: "${childEntityUpper} added successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// Get ${childEntityUpper} by parent ID
${childEntityUpper}Router.get("/get-by-parent/:parentId", async (req, res) => {
  try {
    const pool = req.tenantPool;
    const parentId = req.params.parentId;

    const result = await pool.query(
      \`SELECT * FROM ${childTable.tableName} WHERE ${
      childTable.foreignKey
    } = $1 ORDER BY createdate DESC\`,
      [parentId]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      total: result.rows.length,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// Update ${childEntityUpper}
${childEntityUpper}Router.put("/update-${childEntityLower}", async (req, res) => {
  try {
    const pool = req.tenantPool;
    const { ${childTable.fields.map((f) => f.name).join(", ")}, id } = req.body;

    const updated${childEntityUpper} = await pool.query(
      \`UPDATE ${childTable.tableName} SET ${childTable.fields
      .map((f, i) => `${f.name} = ${i + 1}`)
      .join(", ")} WHERE id = ${childTable.fields.length + 1} RETURNING *\`,
      [${childTable.fields.map((f) => f.name).join(", ")}, id]
    );

    if (updated${childEntityUpper}.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "${childEntityUpper} not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updated${childEntityUpper}.rows[0],
      message: "${childEntityUpper} updated successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// Delete ${childEntityUpper}
${childEntityUpper}Router.delete("/delete-${childEntityLower}/:id", async (req, res) => {
  try {
    const pool = req.tenantPool;
    const ${childEntityLower}Id = req.params.id;

    const deleted${childEntityUpper} = await pool.query(
      \`DELETE FROM ${childTable.tableName} WHERE id = $1 RETURNING *\`,
      [${childEntityLower}Id]
    );

    if (deleted${childEntityUpper}.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "${childEntityUpper} not found",
      });
    }

    res.status(200).json({
      success: true,
      data: deleted${childEntityUpper}.rows[0],
      message: "${childEntityUpper} deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

export { ${parentEntityUpper}, ${childEntityUpper}Router as ${childEntityUpper} };
export default ${parentEntityUpper};`;

    setGeneratedCode({
      mainComponent,
      addComponent,
      listComponent,
      detailsComponent,
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

  const replaceAllFiles = async () => {
    if (
      !parentTable.entityName ||
      !childTable.entityName ||
      !frontendPath ||
      !backendRoutePath
    ) {
      toast.error("Please provide all required information and file paths");
      return;
    }

    setIsReplacing(true);

    try {
      const payload = {
        parentEntityName: parentTable.entityName,
        childEntityName: childTable.entityName,
        parentTableName: parentTable.tableName,
        childTableName: childTable.tableName,
        frontendPath,
        backendPath: backendRoutePath,
        generatedCode: {
          mainComponent: generatedCode.mainComponent,
          addComponent: generatedCode.addComponent,
          listComponent: generatedCode.listComponent,
          detailsComponent: generatedCode.detailsComponent,
          queries: generatedCode.queries,
          mutations: generatedCode.mutations,
          backendRoutes: generatedCode.backendRoutes,
        },
        files: [
          {
            type: "frontend",
            filename: "page.tsx",
            path: `${frontendPath}/${parentTable.entityName.toLowerCase()}`,
            content: generatedCode.mainComponent,
          },
          {
            type: "frontend",
            filename: `add-${parentTable.entityName.toLowerCase()}.tsx`,
            path: `${frontendPath}/${parentTable.entityName.toLowerCase()}/components`,
            content: generatedCode.addComponent,
          },
          {
            type: "frontend",
            filename: `list-${parentTable.entityName.toLowerCase()}.tsx`,
            path: `${frontendPath}/${parentTable.entityName.toLowerCase()}/components`,
            content: generatedCode.listComponent,
          },
          {
            type: "frontend",
            filename: `${parentTable.entityName.toLowerCase()}-details.tsx`,
            path: `${frontendPath}/${parentTable.entityName.toLowerCase()}/components`,
            content: generatedCode.detailsComponent,
          },
          {
            type: "frontend",
            filename: "query.ts",
            path: `${frontendPath}/${parentTable.entityName.toLowerCase()}/service`,
            content: generatedCode.queries,
          },
          {
            type: "frontend",
            filename: "mutation.ts",
            path: `${frontendPath}/${parentTable.entityName.toLowerCase()}/service`,
            content: generatedCode.mutations,
          },
          {
            type: "backend",
            filename: `${parentTable.entityName.toLowerCase()}-routes.js`,
            path: backendRoutePath,
            content: generatedCode.backendRoutes,
          },
        ],
      };

      const apiUrl2 =
        import.meta.env.VITE_API_URL_CODEGEN || "http://localhost:5000";

      const response = await fetch(
        `${apiUrl2}/code-generation/replace-files-master-detail`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(
          "All master-detail files have been successfully replaced!"
        );
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Master-Detail CRUD Generator
        </h1>
        <p className="text-gray-600">
          Generate complete Master-Detail CRUD operations for Parent-Child table
          relationships
        </p>
      </div>

      {!showGenerated ? (
        <div className="grid gap-6">
          {/* Database Schema & Table Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Database Schema & Table Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="seed">Seed</SelectItem>
                      <SelectItem value="core_data">Core Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="parentTable">Parent Table</Label>
                  <Select
                    value={selectedParentTable}
                    onValueChange={setSelectedParentTable}
                    disabled={isLoadingTables || tables.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingTables
                            ? "Loading tables..."
                            : tables.length === 0
                            ? "No tables found"
                            : "Select Parent Table"
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
                <div>
                  <Label htmlFor="childTable">Child Table</Label>
                  <Select
                    value={selectedChildTable}
                    onValueChange={setSelectedChildTable}
                    disabled={isLoadingTables || tables.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingTables
                            ? "Loading tables..."
                            : tables.length === 0
                            ? "No tables found"
                            : "Select Child Table"
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
                    onClick={() => {
                      if (parentColumns.length > 0) {
                        populateFieldsFromTable(parentColumns, true);
                      }
                      if (childColumns.length > 0) {
                        populateFieldsFromTable(childColumns, false);
                      }
                    }}
                    disabled={
                      !selectedParentTable ||
                      !selectedChildTable ||
                      isLoadingParentColumns ||
                      isLoadingChildColumns ||
                      (parentColumns.length === 0 && childColumns.length === 0)
                    }
                    className="w-full"
                    variant="outline"
                  >
                    {isLoadingParentColumns || isLoadingChildColumns ? (
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

              {/* Table Columns Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parentColumns.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2 text-blue-800">
                      Parent Table Columns ({parentColumns.length})
                    </h4>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {parentColumns.map((col, index) => (
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

                {childColumns.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium mb-2 text-green-800">
                      Child Table Columns ({childColumns.length})
                    </h4>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {childColumns.map((col, index) => (
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
              </div>
            </CardContent>
          </Card>

          {/* Project Configuration */}
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
                  <Label htmlFor="foreignKey">Foreign Key Column</Label>
                  <Input
                    id="foreignKey"
                    value={childTable.foreignKey}
                    onChange={(e) =>
                      setChildTable((prev) => ({
                        ...prev,
                        foreignKey: e.target.value,
                      }))
                    }
                    placeholder="parent_id"
                  />
                </div>
                <div>
                  <Label htmlFor="frontendPath">Frontend Path</Label>
                  <Input
                    id="frontendPath"
                    value={frontendPath}
                    onChange={(e) => setFrontendPath(e.target.value)}
                    placeholder="D:\path\to\frontend\src\pages"
                  />
                </div>
                <div>
                  <Label htmlFor="backendPath">Backend Route Path</Label>
                  <Input
                    id="backendPath"
                    value={backendRoutePath}
                    onChange={(e) => setBackendRoutePath(e.target.value)}
                    placeholder="D:\path\to\backend\routes"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parent Table Fields Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-blue-600">
                  <Plus className="h-5 w-5" />
                  Parent Table Fields ({parentTable.entityName || "Parent"})
                </span>
                <Button onClick={() => addField(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {parentTable.fields.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No parent fields added yet. Click "Add Field" or use
                  "Auto-populate Fields" to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {parentTable.fields.map((field) => (
                    <Card key={field.id} className="p-4 border-blue-200">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                        <div>
                          <Label>Field Name</Label>
                          <Input
                            value={field.name}
                            onChange={(e) =>
                              updateField(
                                field.id,
                                "name",
                                e.target.value,
                                true
                              )
                            }
                            placeholder="fieldName"
                          />
                        </div>
                        <div>
                          <Label>Label</Label>
                          <Input
                            value={field.label}
                            onChange={(e) =>
                              updateField(
                                field.id,
                                "label",
                                e.target.value,
                                true
                              )
                            }
                            placeholder="Field Label"
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value) =>
                              updateField(field.id, "type", value, true)
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
                              updateField(
                                field.id,
                                "dbType",
                                e.target.value,
                                true
                              )
                            }
                            placeholder="VARCHAR(255)"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`parent-required-${field.id}`}
                            checked={field.required}
                            onChange={(e) =>
                              updateField(
                                field.id,
                                "required",
                                e.target.checked,
                                true
                              )
                            }
                            className="rounded"
                          />
                          <Label htmlFor={`parent-required-${field.id}`}>
                            Required
                          </Label>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeField(field.id, true)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {/* Field options */}
                      {field.type === "select" && (
                        <div className="mt-4">
                          <Label>Select Options (comma-separated)</Label>
                          <Input
                            value={field.selectOptions}
                            onChange={(e) =>
                              updateField(
                                field.id,
                                "selectOptions",
                                e.target.value,
                                true
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
                                e.target.value,
                                true
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
                              updateField(field.id, "defaultValue", value, true)
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

          {/* Child Table Fields Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-green-600">
                  <Plus className="h-5 w-5" />
                  Child Table Fields ({childTable.entityName || "Child"})
                </span>
                <Button onClick={() => addField(false)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {childTable.fields.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No child fields added yet. Click "Add Field" or use
                  "Auto-populate Fields" to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {childTable.fields.map((field) => (
                    <Card key={field.id} className="p-4 border-green-200">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                        <div>
                          <Label>Field Name</Label>
                          <Input
                            value={field.name}
                            onChange={(e) =>
                              updateField(
                                field.id,
                                "name",
                                e.target.value,
                                false
                              )
                            }
                            placeholder="fieldName"
                          />
                        </div>
                        <div>
                          <Label>Label</Label>
                          <Input
                            value={field.label}
                            onChange={(e) =>
                              updateField(
                                field.id,
                                "label",
                                e.target.value,
                                false
                              )
                            }
                            placeholder="Field Label"
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value) =>
                              updateField(field.id, "type", value, false)
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
                              updateField(
                                field.id,
                                "dbType",
                                e.target.value,
                                false
                              )
                            }
                            placeholder="VARCHAR(255)"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`child-required-${field.id}`}
                            checked={field.required}
                            onChange={(e) =>
                              updateField(
                                field.id,
                                "required",
                                e.target.checked,
                                false
                              )
                            }
                            className="rounded"
                          />
                          <Label htmlFor={`child-required-${field.id}`}>
                            Required
                          </Label>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeField(field.id, false)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {/* Field options */}
                      {field.type === "select" && (
                        <div className="mt-4">
                          <Label>Select Options (comma-separated)</Label>
                          <Input
                            value={field.selectOptions}
                            onChange={(e) =>
                              updateField(
                                field.id,
                                "selectOptions",
                                e.target.value,
                                false
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
                                e.target.value,
                                false
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
                              updateField(
                                field.id,
                                "defaultValue",
                                value,
                                false
                              )
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

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button
              onClick={generateCode}
              size="lg"
              disabled={
                !parentTable.entityName ||
                !childTable.entityName ||
                !childTable.foreignKey ||
                parentTable.fields.length === 0 ||
                childTable.fields.length === 0
              }
              className="px-8"
            >
              <Code className="h-5 w-5 mr-2" />
              Generate Master-Detail CRUD Code
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Generated Master-Detail Code</h2>
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

          {/* File Replacement Paths */}
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
                  📁 Master-Detail files that will be created/replaced:
                </h4>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="space-y-1 text-green-700">
                    <div>
                      • {frontendPath}/
                      {parentTable.entityName.toLowerCase() || "parent"}
                      /page.tsx
                    </div>
                    <div>
                      • {frontendPath}/
                      {parentTable.entityName.toLowerCase() || "parent"}
                      /components/add-
                      {parentTable.entityName.toLowerCase() || "parent"}.tsx
                    </div>
                    <div>
                      • {frontendPath}/
                      {parentTable.entityName.toLowerCase() || "parent"}
                      /components/list-
                      {parentTable.entityName.toLowerCase() || "parent"}.tsx
                    </div>
                    <div>
                      • {frontendPath}/
                      {parentTable.entityName.toLowerCase() || "parent"}
                      /components/
                      {parentTable.entityName.toLowerCase() || "parent"}
                      -details.tsx
                    </div>
                    <div>
                      • {frontendPath}/
                      {parentTable.entityName.toLowerCase() || "parent"}
                      /service/query.ts
                    </div>
                    <div>
                      • {frontendPath}/
                      {parentTable.entityName.toLowerCase() || "parent"}
                      /service/mutation.ts
                    </div>
                  </div>
                  <div className="space-y-1 text-blue-700">
                    <div>
                      • {backendRoutePath}/
                      {parentTable.entityName.toLowerCase() || "parent"}
                      -routes.js
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Code Tabs */}
          <Tabs defaultValue="main" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="main">Main Page</TabsTrigger>
              <TabsTrigger value="add">Add Component</TabsTrigger>
              <TabsTrigger value="list">List Component</TabsTrigger>
              <TabsTrigger value="details">Details Component</TabsTrigger>
              <TabsTrigger value="queries">Queries</TabsTrigger>
              <TabsTrigger value="mutations">Mutations</TabsTrigger>
              <TabsTrigger value="backend">Backend Routes</TabsTrigger>
            </TabsList>

            {Object.entries({
              main: {
                code: generatedCode.mainComponent,
                filename: `page.tsx`,
              },
              add: {
                code: generatedCode.addComponent,
                filename: `add-${parentTable.entityName.toLowerCase()}.tsx`,
              },
              list: {
                code: generatedCode.listComponent,
                filename: `list-${parentTable.entityName.toLowerCase()}.tsx`,
              },
              details: {
                code: generatedCode.detailsComponent,
                filename: `${parentTable.entityName.toLowerCase()}-details.tsx`,
              },
              queries: {
                code: generatedCode.queries,
                filename: "query.ts",
              },
              mutations: {
                code: generatedCode.mutations,
                filename: "mutation.ts",
              },
              backend: {
                code: generatedCode.backendRoutes,
                filename: `${parentTable.entityName.toLowerCase()}-routes.js`,
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

export default MasterDetailCodeGenerationPage;
