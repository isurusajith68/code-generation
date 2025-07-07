import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Save } from "lucide-react";
import { toast } from "sonner";

import DatabaseIntegration from "./components/DatabaseIntegration";
import ProjectConfiguration from "./components/ProjectConfiguration";
import TableConfiguration from "./components/TableConfiguration";
import CodeDisplay from "./components/CodeDisplay";

import {
  generateZodSchema,
  generateFormFields,
  generateTableHeaders,
  generateBackendFields,
} from "./utils/codeGenerators";

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
  editComponent: string;
  listComponent: string;
  detailsComponent: string;
  queries: string;
  mutations: string;
  backendRoutes: string;
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

  const [childTable, setChildTable] = useState<TableInfo>({
    tableName: "",
    entityName: "",
    fields: [],
    foreignKey: "",
  });

  const [generatedCode, setGeneratedCode] = useState<GeneratedCode>({
    mainComponent: "",
    addComponent: "",
    editComponent: "",
    listComponent: "",
    detailsComponent: "",
    queries: "",
    mutations: "",
    backendRoutes: "",
  });

  const [showGenerated, setShowGenerated] = useState(false);

  const generateCode = () => {
    if (!parentTable.entityName || !childTable.entityName) {
      toast.error(
        "Please provide entity names for both parent and child tables"
      );
      return;
    }

    if (parentTable.fields.length === 0 || childTable.fields.length === 0) {
      toast.error("Please add fields for both parent and child tables");
      return;
    }

    if (!childTable.foreignKey) {
      toast.error("Please specify the foreign key column");
      return;
    }

    const parentEntityLower = parentTable.entityName.toLowerCase();
    const parentEntityUpper =
      parentTable.entityName.charAt(0).toUpperCase() +
      parentTable.entityName.slice(1);
    const childEntityLower = childTable.entityName.toLowerCase();
    const childEntityUpper =
      childTable.entityName.charAt(0).toUpperCase() +
      childTable.entityName.slice(1);

    const backendFields = generateBackendFields(
      parentTable.fields,
      childTable.fields
    );

    const mainComponent = generateMainComponent(
      parentEntityUpper,
      parentEntityLower
    );
    const addComponent = generateAddComponent(
      parentTable,
      childTable,
      parentEntityUpper,
      parentEntityLower,
      childEntityUpper,
      childEntityLower
    );
    const editComponent = generateEditComponent(
      parentTable,
      childTable,
      parentEntityUpper,
      parentEntityLower,
      childEntityUpper,
      childEntityLower
    );
    const listComponent = generateListComponent(
      parentTable,
      parentEntityUpper,
      parentEntityLower,
      childEntityLower
    );
    const detailsComponent = generateDetailsComponent(
      parentTable,
      childTable,
      parentEntityUpper,
      parentEntityLower,
      childEntityUpper,
      childEntityLower
    );
    const queries = generateQueries(
      parentEntityUpper,
      parentEntityLower,
      childEntityUpper,
      childEntityLower
    );
    const mutations = generateMutations(
      parentEntityUpper,
      parentEntityLower,
      childEntityUpper,
      childEntityLower
    );
    const backendRoutes = generateBackendRoutes(
      parentTable,
      childTable,
      parentEntityUpper,
      parentEntityLower,
      childEntityUpper,
      childEntityLower,
      backendFields
    );

    setGeneratedCode({
      mainComponent,
      addComponent,
      editComponent,
      listComponent,
      detailsComponent,
      queries,
      mutations,
      backendRoutes,
    });
    setShowGenerated(true);
  };

  const generateMainComponent = (
    parentEntityUpper: string,
    parentEntityLower: string
  ) => {
    return `"use client";

import React from "react";
import Add${parentEntityUpper} from "./components/add-${parentEntityLower}";
import Edit${parentEntityUpper} from "./components/edit-${parentEntityLower}";
import List${parentEntityUpper} from "./components/list-${parentEntityLower}";
import ${parentEntityUpper}Details from "./components/${parentEntityLower}-details";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PackagePlus, Eye, Edit } from "lucide-react";

const ${parentEntityUpper}Page = () => {
  const [open, setOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
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

      <Dialog open={editOpen} onOpenChange={setEditOpen} modal={true}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-6">
              <Edit className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-primary">
                Edit ${parentEntityUpper}
              </h2>
            </div>
          </DialogHeader>
          {selectedParentId && (
            <Edit${parentEntityUpper} 
              ${parentEntityLower}Id={selectedParentId} 
              setOpen={setEditOpen} 
            />
          )}
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
        setEditOpen={setEditOpen}
        setDetailsOpen={setDetailsOpen}
        setSelectedParentId={setSelectedParentId}
      />
    </div>
  );
};

export default ${parentEntityUpper}Page;`;
  };

  const generateAddComponent = (
    parentTable: TableInfo,
    childTable: TableInfo,
    parentEntityUpper: string,
    parentEntityLower: string,
    childEntityUpper: string,
    childEntityLower: string
  ) => {
    return `"use client";

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

          {/* Child Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                ${childEntityUpper} Items
                <Button
                  type="button"
                  onClick={addDetailItem}
                  size="sm"
                  className="ml-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add ${childEntityUpper}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="bg-gray-500">
                  <TableRow>
                    ${generateTableHeaders(childTable.fields)}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      ${childTable.fields
                        .map((f) => {
                          if (f.type === "text" || f.type === "email") {
                            return `<TableCell>
                        <FormField
                          control={form.control}
                          name={\`${childEntityLower}Items.\${index}.${f.name}\`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} placeholder="${f.label}" />
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
                                  {...field} 
                                  type="number" 
                                  placeholder="${f.label}"
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>`;
                          } else if (f.type === "select") {
                            const options = f.selectOptions
                              ? f.selectOptions
                                  .split(",")
                                  .map((opt) => opt.trim())
                              : [];
                            return `<TableCell>
                        <FormField
                          control={form.control}
                          name={\`${childEntityLower}Items.\${index}.${
                              f.name
                            }\`}
                          render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select ${
                                      f.label
                                    }" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  ${options
                                    .map(
                                      (option) =>
                                        `<SelectItem value="${option}">${option}</SelectItem>`
                                    )
                                    .join(
                                      "\n                                  "
                                    )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>`;
                          } else if (f.type === "boolean") {
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
                          } else if (f.type === "textarea") {
                            return `<TableCell>
                        <FormField
                          control={form.control}
                          name={\`${childEntityLower}Items.\${index}.${f.name}\`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea {...field} placeholder="${f.label}" />
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
                          name={\`${childEntityLower}Items.\${index}.${f.name}\`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} placeholder="${f.label}" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>`;
                          }
                        })
                        .join("\n                      ")}
                      <TableCell>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
  };

  const generateEditComponent = (
    parentTable: TableInfo,
    childTable: TableInfo,
    parentEntityUpper: string,
    parentEntityLower: string,
    childEntityUpper: string,
    childEntityLower: string
  ) => {
    return `"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, Plus } from "lucide-react";
import { useUpdate${parentEntityUpper}Mutation } from "../service/mutation";
import { useGet${parentEntityUpper}ById } from "../service/query";
${
  parentTable.fields.some((f) => f.type === "select") ||
  childTable.fields.some((f) => f.type === "select")
    ? 'import {\n  Select,\n  SelectContent,\n  SelectItem,\n  SelectTrigger,\n  SelectValue,\n} from "@/components/ui/select";'
    : ""
}
${
  parentTable.fields.some((f) => f.type === "boolean") ||
  childTable.fields.some((f) => f.type === "boolean")
    ? 'import { Switch } from "@/components/ui/switch";'
    : ""
}
${
  parentTable.fields.some((f) => f.type === "textarea") ||
  childTable.fields.some((f) => f.type === "textarea")
    ? 'import { Textarea } from "@/components/ui/textarea";'
    : ""
}

${generateZodSchema(parentTable.fields, parentTable.entityName)}

${generateZodSchema(childTable.fields, childTable.entityName)}

const formSchema = z.object({
  ${parentTable.fields
    .map(
      (field) =>
        `${field.name}: ${parentTable.entityName.toLowerCase()}Schema.shape.${
          field.name
        }`
    )
    .join(",\n  ")},
  ${childEntityLower}Items: z.array(${childTable.entityName.toLowerCase()}Schema).min(0, "Items are optional for editing"),
});

interface Edit${parentEntityUpper}Props {
  ${parentEntityLower}Id: number;
  setOpen: (open: boolean) => void;
}

const Edit${parentEntityUpper}: React.FC<Edit${parentEntityUpper}Props> = ({
  ${parentEntityLower}Id,
  setOpen,
}) => {
  const { data: ${parentEntityLower}Data, isLoading } = useGet${parentEntityUpper}ById(${parentEntityLower}Id);
  const { mutate: update${parentEntityUpper}, isPending } = useUpdate${parentEntityUpper}Mutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ${parentTable.fields
        .map((field) => {
          if (field.type === "boolean") {
            return `${field.name}: false,`;
          } else if (field.type === "number") {
            return `${field.name}: 0,`;
          } else {
            return `${field.name}: "",`;
          }
        })
        .join("\n      ")}
      ${childEntityLower}Items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "${childEntityLower}Items",
  });

  // Load data when component mounts or ${parentEntityLower}Id changes
  useEffect(() => {
    if (${parentEntityLower}Data) {
      form.reset({
        ${parentTable.fields
          .map(
            (field) =>
              `${field.name}: ${parentEntityLower}Data.${field.name} || ${
                field.type === "boolean"
                  ? "false"
                  : field.type === "number"
                  ? "0"
                  : '""'
              },`
          )
          .join("\n        ")}
        ${childEntityLower}Items: ${parentEntityLower}Data.${childEntityLower}Items || [],
      });
    }
  }, [${parentEntityLower}Data, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    update${parentEntityUpper}(
      {
        id: ${parentEntityLower}Id,
        data: values,
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  const addNewItem = () => {
    append({
      ${childTable.fields
        .map((field) => {
          if (field.type === "boolean") {
            return `${field.name}: false,`;
          } else if (field.type === "number") {
            return `${field.name}: 0,`;
          } else {
            return `${field.name}: "",`;
          }
        })
        .join("\n      ")}
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Parent Fields */}
          <Card>
            <CardHeader>
              <CardTitle>${parentEntityUpper} Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              ${generateFormFields(parentTable.fields)}
            </CardContent>
          </Card>

          {/* Child Fields */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>${childEntityUpper} Items</CardTitle>
              <Button type="button" onClick={addNewItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add ${childEntityUpper}
              </Button>
            </CardHeader>
            <CardContent>
              {fields.length > 0 ? (
                <Table>
                  <TableHeader className="bg-gray-500">
                    <TableRow>
                      ${generateTableHeaders(childTable.fields)}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        ${childTable.fields
                          .map((f) => {
                            if (f.type === "number") {
                              return `<TableCell>
                        <FormField
                          control={form.control}
                          name={\`${childEntityLower}Items.\${index}.${f.name}\`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  placeholder="${f.label}"
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>`;
                            } else if (f.type === "select") {
                              const options = f.selectOptions
                                ? f.selectOptions
                                    .split(",")
                                    .map((opt) => opt.trim())
                                : [];
                              return `<TableCell>
                        <FormField
                          control={form.control}
                          name={\`${childEntityLower}Items.\${index}.${
                                f.name
                              }\`}
                          render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select ${
                                      f.label
                                    }" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  ${options
                                    .map(
                                      (option) =>
                                        `<SelectItem value="${option}">${option}</SelectItem>`
                                    )
                                    .join(
                                      "\n                                  "
                                    )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>`;
                            } else if (f.type === "radio") {
                              const options = f.radioOptions
                                ? f.radioOptions
                                    .split(",")
                                    .map((opt) => opt.trim())
                                : [];
                              return `<TableCell>
                        <FormField
                          control={form.control}
                          name={\`${childEntityLower}Items.\${index}.${
                                f.name
                              }\`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="flex flex-row space-x-4"
                                >
                                  ${options
                                    .map(
                                      (option) =>
                                        `<div className="flex items-center space-x-2">
                                    <RadioGroupItem value="${option}" id="${option.toLowerCase()}-\${index}" />
                                    <label htmlFor="${option.toLowerCase()}-\${index}" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                      ${option}
                                    </label>
                                  </div>`
                                    )
                                    .join(
                                      "\n                                  "
                                    )}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>`;
                            } else if (f.type === "boolean") {
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
                            } else if (f.type === "textarea") {
                              return `<TableCell>
                        <FormField
                          control={form.control}
                          name={\`${childEntityLower}Items.\${index}.${f.name}\`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea {...field} placeholder="${f.label}" />
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
                          name={\`${childEntityLower}Items.\${index}.${f.name}\`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} placeholder="${f.label}" />
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
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No ${childEntityLower} items added yet.
                  <br />
                  <Button type="button" onClick={addNewItem} size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First ${childEntityUpper}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer"
              type="submit"
              disabled={form.formState.isSubmitting || isPending}
            >
              {form.formState.isSubmitting || isPending
                ? "Updating..."
                : "Update ${parentEntityUpper}"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Edit${parentEntityUpper};`;
  };

  const generateListComponent = (
    parentTable: TableInfo,
    parentEntityUpper: string,
    parentEntityLower: string,
    childEntityLower: string
  ) => {
    return `import { useState } from "react";
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
  Card,
  CardContent,
  CardDescription,
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
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { useDelete${parentEntityUpper}Mutation } from "../service/mutation";
import { toast } from "sonner";

interface List${parentEntityUpper}Props {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setDetailsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedParentId: React.Dispatch<React.SetStateAction<number | null>>;
}

const List${parentEntityUpper} = ({
  setOpen,
  setEditOpen,
  setDetailsOpen,
  setSelectedParentId,
}: List${parentEntityUpper}Props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    data: ${parentEntityLower}Data,
    isLoading,
    error,
  } = useGet${parentEntityUpper}(currentPage, itemsPerPage);

  const { mutate: delete${parentEntityUpper} } = useDelete${parentEntityUpper}Mutation();

  const handleDelete = (id: number) => {
    delete${parentEntityUpper}(id, {
      onSuccess: () => {
        toast.success("${parentEntityUpper} deleted successfully");
      },
      onError: (error) => {
        toast.error("Failed to delete ${parentEntityLower}");
      },
    });
  };

  const handleEdit = (id: number) => {
    setSelectedParentId(id);
    setEditOpen(true);
  };

  const handleView = (id: number) => {
    setSelectedParentId(id);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            Error loading ${parentEntityLower} data
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPages = Math.ceil((${parentEntityLower}Data?.total || 0) / itemsPerPage);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            ${parentEntityUpper} Management
          </CardTitle>
          <CardDescription>
            Manage your ${parentEntityLower} records and associated ${childEntityLower} items
          </CardDescription>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Package className="w-4 h-4 mr-2" />
          Add ${parentEntityUpper}
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="bg-gray-500">
            <TableRow>
              ${generateTableHeaders(parentTable.fields)}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {${parentEntityLower}Data?.data?.map((item: any) => (
              <TableRow key={item.id}>
                ${parentTable.fields
                  .map((field) => {
                    if (field.type === "boolean") {
                      return `<TableCell>
                    <Badge variant={item.${field.name} ? "default" : "secondary"}>
                      {item.${field.name} ? "Yes" : "No"}
                    </Badge>
                  </TableCell>`;
                    }
                    return `<TableCell>{item.${field.name}}</TableCell>`;
                  })
                  .join("\n                ")}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(item.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(item.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            ${parentEntityLower} and all associated ${childEntityLower} records.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(item.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default List${parentEntityUpper};`;
  };

  const generateDetailsComponent = (
    parentTable: TableInfo,
    childTable: TableInfo,
    parentEntityUpper: string,
    parentEntityLower: string,
    childEntityUpper: string,
    childEntityLower: string
  ) => {
    return `import { useGet${parentEntityUpper}ById } from "../service/query";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Package, ListChecks } from "lucide-react";

interface ${parentEntityUpper}DetailsProps {
  parentId: number;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ${parentEntityUpper}Details = ({ parentId, setOpen }: ${parentEntityUpper}DetailsProps) => {
  const {
    data: ${parentEntityLower}Data,
    isLoading,
    error,
  } = useGet${parentEntityUpper}ById(parentId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">Loading ${parentEntityLower} details...</div>
      </div>
    );
  }

  if (error || !${parentEntityLower}Data) {
    return (
      <div className="space-y-6">
        <div className="text-center text-red-500">
          Error loading ${parentEntityLower} details
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Parent Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            ${parentEntityUpper} Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${parentTable.fields
              .map((field) => {
                if (field.type === "boolean") {
                  return `<div>
              <label className="text-sm font-medium text-gray-500">${field.label}</label>
              <div className="mt-1">
                <Badge variant={${parentEntityLower}Data.${field.name} ? "default" : "secondary"}>
                  {${parentEntityLower}Data.${field.name} ? "Yes" : "No"}
                </Badge>
              </div>
            </div>`;
                }
                return `<div>
              <label className="text-sm font-medium text-gray-500">${field.label}</label>
              <p className="mt-1 font-medium">{${parentEntityLower}Data.${field.name}}</p>
            </div>`;
              })
              .join("\n            ")}
          </div>
        </CardContent>
      </Card>

      {/* Child Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="w-5 h-5" />
            ${childEntityUpper} Items
          </CardTitle>
          <CardDescription>
            Associated ${childEntityLower} records for this ${parentEntityLower}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {${parentEntityLower}Data.${childEntityLower}Items && ${parentEntityLower}Data.${childEntityLower}Items.length > 0 ? (
            <Table>
              <TableHeader className="bg-gray-500">
                <TableRow>
                  ${generateTableHeaders(childTable.fields)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {${parentEntityLower}Data.${childEntityLower}Items.map((item: any, index: number) => (
                  <TableRow key={index}>
                    ${childTable.fields
                      .map((field) => {
                        if (field.type === "boolean") {
                          return `<TableCell>
                      <Badge variant={item.${field.name} ? "default" : "secondary"}>
                        {item.${field.name} ? "Yes" : "No"}
                      </Badge>
                    </TableCell>`;
                        }
                        return `<TableCell>{item.${field.name}}</TableCell>`;
                      })
                      .join("\n                    ")}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No ${childEntityLower} items found for this ${parentEntityLower}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ${parentEntityUpper}Details;`;
  };

  const generateQueries = (
    parentEntityUpper: string,
    parentEntityLower: string,
    _childEntityUpper: string,
    _childEntityLower: string
  ) => {
    void _childEntityUpper;
    void _childEntityLower;
    return `import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const useGet${parentEntityUpper} = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["${parentEntityLower}s", page, limit],
    queryFn: async () => {
      const response = await axios.get(
        \`\${API_BASE_URL}/${parentEntityLower}s/get-all?page=\${page}&limit=\${limit}\`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
  });
};

// Get ${parentEntityLower} by ID with associated items
export const useGet${parentEntityUpper}ById = (id: number) => {
  return useQuery({
    queryKey: ["${parentEntityLower}", id],
    queryFn: async () => {
      const response = await axios.get(\`\${API_BASE_URL}/${parentEntityLower}s/get-by-id/\${id}\`, {
        withCredentials: true,
      });
      return response.data;
    },
    enabled: !!id,
  });
};`;
  };

  const generateMutations = (
    parentEntityUpper: string,
    parentEntityLower: string,
    childEntityUpper: string,
    childEntityLower: string
  ) => {
    return `import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Add ${parentEntityLower} with ${childEntityLower} items
export const useAdd${parentEntityUpper}Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post(\`\${API_BASE_URL}/${parentEntityLower}s/create\`, data, {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["${parentEntityLower}s"] });
    },
  });
};

// Update ${parentEntityLower}
export const useUpdate${parentEntityUpper}Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await axios.put(\`\${API_BASE_URL}/${parentEntityLower}s/update/\${id}\`, data,{
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["${parentEntityLower}s"] });
      queryClient.invalidateQueries({ queryKey: ["${parentEntityLower}"] });
    },
  });
};

// Delete ${parentEntityLower}
export const useDelete${parentEntityUpper}Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.delete(\`\${API_BASE_URL}/${parentEntityLower}s/delete/\${id}\`, {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["${parentEntityLower}s"] });
    },
  });
};`;
  };

  const generateBackendRoutes = (
    parentTable: TableInfo,
    childTable: TableInfo,
    parentEntityUpper: string,
    parentEntityLower: string,
    childEntityUpper: string,
    childEntityLower: string,
    backendFields: any
  ) => {
    return `import express from 'express';
const ${parentEntityUpper} = express.Router();

// GET /${parentEntityLower}s/get-all - Get all ${parentEntityLower}s with pagination
${parentEntityUpper}.get('/get-all', async (req, res) => {
  try {
    const pool = req.tenantPool;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM ${
      parentTable.tableName
    }');
    const total = parseInt(countResult.rows[0].count);

    // Get ${parentEntityLower}s with pagination
    const result = await pool.query(
      'SELECT id,${backendFields.parent.selectFields} FROM ${
      parentTable.tableName
    } ORDER BY id LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.json({
      data: result.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching ${parentEntityLower}s:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /${parentEntityLower}s/get-by-id/:id - Get ${parentEntityLower} by ID with ${childEntityLower} items
${parentEntityUpper}.get('/get-by-id/:id', async (req, res) => {
  try {
    const pool = req.tenantPool;
    const { id } = req.params;

    // Get ${parentEntityLower}
    const ${parentEntityLower}Result = await pool.query(
      'SELECT ${backendFields.parent.selectFields} FROM ${
      parentTable.tableName
    } WHERE id = $1',
      [id]
    );

    if (${parentEntityLower}Result.rows.length === 0) {
      return res.status(404).json({ error: '${parentEntityUpper} not found' });
    }

    // Get ${childEntityLower} items
    const ${childEntityLower}Result = await pool.query(
      'SELECT ${backendFields.child.selectFields} FROM ${
      childTable.tableName
    } WHERE ${childTable.foreignKey} = $1',
      [id]
    );

    const ${parentEntityLower}Data = ${parentEntityLower}Result.rows[0];
    ${parentEntityLower}Data.${childEntityLower}Items = ${childEntityLower}Result.rows;

    res.json(${parentEntityLower}Data);
  } catch (error) {
    console.error('Error fetching ${parentEntityLower}:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /${parentEntityLower}s/create - Create ${parentEntityLower} with ${childEntityLower} items
${parentEntityUpper}.post('/create', async (req, res) => {
  const pool = req.tenantPool;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { ${parentEntityLower}, ${childEntityLower}Items } = req.body;

    // Insert ${parentEntityLower}
    const ${parentEntityLower}Result = await client.query(
      'INSERT INTO ${parentTable.tableName} (${
      backendFields.parent.insertFields
    }) VALUES (${backendFields.parent.insertPlaceholders}) RETURNING id',
      [${parentTable.fields
        .map((field: any) => `${parentEntityLower}.${field.name}`)
        .join(", ")}]
    );

    const ${parentEntityLower}Id = ${parentEntityLower}Result.rows[0].id;

    // Insert ${childEntityLower} items
    for (const item of ${childEntityLower}Items) {
      await client.query(
        'INSERT INTO ${childTable.tableName} (${
      backendFields.child.insertFields
    }, ${childTable.foreignKey}) VALUES (${
      backendFields.child.insertPlaceholders
    }, $${backendFields.child.insertPlaceholders.split(", ").length + 1})',
        [${childTable.fields
          .map((field: any) => `item.${field.name}`)
          .join(", ")}, ${parentEntityLower}Id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ id: ${parentEntityLower}Id, message: '${parentEntityUpper} created successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating ${parentEntityLower}:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// PUT /${parentEntityLower}s/update/:id - Update ${parentEntityLower}
${parentEntityUpper}.put('/update/:id', async (req, res) => {
  const pool = req.tenantPool;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { ${childEntityLower}Items, ...parentData } = req.body;

    // Update parent entity (exclude child items)
    const parentFields = Object.keys(parentData);
    const setClause = parentFields
      .map((key, index) => \`\${key} = $\${index + 2}\`)
      .join(', ');
    
    const parentValues = [id, ...Object.values(parentData)];

    const parentResult = await client.query(
      \`UPDATE ${
        parentTable.tableName
      } SET \${setClause} WHERE id = $1 RETURNING *\`,
      parentValues
    );

    if (parentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: '${parentEntityUpper} not found' });
    }

    // Update child items if provided
    if (${childEntityLower}Items && Array.isArray(${childEntityLower}Items)) {
      // Delete existing child items
      await client.query('DELETE FROM ${childTable.tableName} WHERE ${
        childTable.foreignKey
      } = $1', [id]);

      // Insert updated child items
      for (const item of ${childEntityLower}Items) {
        await client.query(
          'INSERT INTO ${childTable.tableName} (${
        backendFields.child.insertFields
      }, ${childTable.foreignKey}) VALUES (${
        backendFields.child.insertPlaceholders
      }, $${backendFields.child.insertPlaceholders.split(", ").length + 1})',
          [${childTable.fields
            .map((field: any) => `item.${field.name}`)
            .join(", ")}, id]
        );
      }
    }

    await client.query('COMMIT');
    res.json(parentResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating ${parentEntityLower}:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// DELETE /${parentEntityLower}s/delete/:id - Delete ${parentEntityLower} and associated ${childEntityLower} items
${parentEntityUpper}.delete('/delete/:id', async (req, res) => {
  const pool = req.tenantPool;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Delete ${childEntityLower} items first (foreign key constraint)
    await client.query('DELETE FROM ${childTable.tableName} WHERE ${
      childTable.foreignKey
    } = $1', [id]);

    // Delete ${parentEntityLower}
    const result = await client.query('DELETE FROM ${
      parentTable.tableName
    } WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: '${parentEntityUpper} not found' });
    }

    await client.query('COMMIT');
    res.json({ message: '${parentEntityUpper} deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting ${parentEntityLower}:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

export default ${parentEntityUpper};`;
  };

  // Function to replace files using the master-detail API
  const replaceFilesMasterDetail = async () => {
    // Validation
    if (!parentTable.entityName || !childTable.entityName) {
      toast.error(
        "Please provide entity names for both parent and child tables"
      );
      return;
    }

    if (!frontendPath || !backendRoutePath) {
      toast.error("Please provide frontend and backend paths");
      return;
    }

    if (!projectName) {
      toast.error("Please provide a project name");
      return;
    }

    if (!showGenerated) {
      toast.error("Please generate the code first before replacing files");
      return;
    }

    // Validate full Windows paths
    const pathErrors = validateFullPaths();
    if (pathErrors.length > 0) {
      toast.error(pathErrors.join(" "));
      return;
    }

    try {
      toast.loading("Creating master-detail folder structure and files...");

      const apiUrl =
        import.meta.env.VITE_API_URL_CODEGEN || "http://localhost:5000";

      // Get entity names for folder structure
      const parentEntityUpper =
        parentTable.entityName.charAt(0).toUpperCase() +
        parentTable.entityName.slice(1);
      const parentEntityLower = parentTable.entityName.toLowerCase();

      // Create folder structure paths
      const frontendEntityPath = `${frontendPath}\\${parentEntityLower}`;
      const frontendComponentsPath = `${frontendEntityPath}\\components`;
      const frontendServicePath = `${frontendEntityPath}\\service`;
      const backendEntityPath = `${backendRoutePath}`;

      // Prepare files array for the API with organized folder structure
      const files = [
        {
          filename: `page.tsx`,
          path: frontendEntityPath,
          content: generatedCode.mainComponent,
          type: "frontend",
        },
        {
          filename: `add-${parentEntityLower}.tsx`,
          path: frontendComponentsPath,
          content: generatedCode.addComponent,
          type: "frontend",
        },
        {
          filename: `edit-${parentEntityLower}.tsx`,
          path: frontendComponentsPath,
          content: generatedCode.editComponent,
          type: "frontend",
        },
        {
          filename: `list-${parentEntityLower}.tsx`,
          path: frontendComponentsPath,
          content: generatedCode.listComponent,
          type: "frontend",
        },
        {
          filename: `${parentEntityLower}-details.tsx`,
          path: frontendComponentsPath,
          content: generatedCode.detailsComponent,
          type: "frontend",
        },
        {
          filename: `query.ts`,
          path: frontendServicePath,
          content: generatedCode.queries,
          type: "frontend",
        },
        {
          filename: `mutation.ts`,
          path: frontendServicePath,
          content: generatedCode.mutations,
          type: "frontend",
        },
        {
          filename: `${parentEntityLower}-routes.js`,
          path: backendEntityPath,
          content: generatedCode.backendRoutes,
          type: "backend",
        },
      ];

      const response = await fetch(
        `${apiUrl}/code-generation/replace-files-master-detail`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            parentEntityName: parentTable.entityName,
            childEntityName: childTable.entityName,
            parentTableName: parentTable.tableName,
            childTableName: childTable.tableName,
            frontendPath,
            backendPath: backendRoutePath,
            createFolderStructure: true,
            entityFolderName: parentEntityUpper,
            frontendPaths: {
              main: frontendEntityPath,
              components: frontendComponentsPath,
              service: frontendServicePath,
            },
            backendPaths: {
              routes: backendEntityPath,
            },
            generatedCode,
            files,
          }),
        }
      );

      const result = await response.json();
      toast.dismiss();

      if (result.success) {
        toast.success(
          `Successfully created ${result.data.summary.totalFiles} master-detail files in organized folder structure!`
        );
        console.log("Created files:", result.data.createdFiles);

        console.log(`Frontend folder created: ${frontendEntityPath}`);
        console.log(`Components folder: ${frontendComponentsPath}`);
        console.log(`Service folder: ${frontendServicePath}`);
        console.log(`Backend folder: ${backendEntityPath}`);

        const summary = result.data.summary;
        toast.success(
          `${parentEntityUpper} module created successfully!\nFolder: ${parentEntityUpper}/\n├── components/ (${
            summary.frontendFiles - 2
          } files)\n├── service/ (2 files)\n└── page.tsx\nBackend: ${
            summary.backendFiles
          } files`,
          { duration: 8000 }
        );
      } else {
        toast.error(
          result.message || "Failed to create folder structure and files"
        );
      }
    } catch (error) {
      toast.dismiss();
      console.error("Error replacing files:", error);
      toast.error(
        "Failed to replace files. Please check the console for details."
      );
    }
  };

  const validateFullPaths = () => {
    const errors = [];

    if (frontendPath && !frontendPath.match(/^[A-Za-z]:\\/)) {
      errors.push(
        "Frontend path should be a full Windows path (e.g., D:\\ceyinfo\\...)"
      );
    }

    if (backendRoutePath && !backendRoutePath.match(/^[A-Za-z]:\\/)) {
      errors.push(
        "Backend path should be a full Windows path (e.g., D:\\ceyinfo\\...)"
      );
    }

    return errors;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-6 h-6" />
            Master-Detail CRUD Code Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ProjectConfiguration
            projectName={projectName}
            setProjectName={setProjectName}
            frontendPath={frontendPath}
            setFrontendPath={setFrontendPath}
            backendRoutePath={backendRoutePath}
            setBackendRoutePath={setBackendRoutePath}
          />

          <DatabaseIntegration
            parentTable={parentTable}
            setParentTable={setParentTable}
            childTable={childTable}
            setChildTable={setChildTable}
          />

          <TableConfiguration
            parentTable={parentTable}
            setParentTable={setParentTable}
            childTable={childTable}
            setChildTable={setChildTable}
          />

          <div className="space-y-4">
            <div className="flex justify-center">
              <Button onClick={generateCode} size="lg" className="w-full">
                <Play className="w-5 h-5 mr-2" />
                Generate Master-Detail Code
              </Button>
            </div>

            {showGenerated && (
              <div className="flex justify-center">
                <Button
                  onClick={replaceFilesMasterDetail}
                  size="lg"
                  className="w-full"
                  variant="outline"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Replace Files (Master-Detail)
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showGenerated && (
        <CodeDisplay
          generatedCode={generatedCode}
          projectName={projectName}
          parentTable={parentTable}
        />
      )}
    </div>
  );
};

export default MasterDetailCodeGenerationPage;
