import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Save } from "lucide-react";
import { toast } from "sonner";

import DatabaseIntegration from "./components/DatabaseIntegration";
import ProjectConfiguration from "./components/ProjectConfiguration";
import TableConfiguration from "./components/TableConfiguration";
import TableSettings from "./components/TableSettings";
import CodeDisplay from "./components/CodeDisplay";

import {
  generateZodSchema,
  generateFormFields,
  generateTableHeaders,
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

interface GeneratedCode {
  mainComponent: string;
  formComponent: string;
  listComponent: string;
  detailsComponent: string;
  queries: string;
  mutations: string;
  backendRoutes: string;
  routingHelper?: {
    routeImport: string;
    routeElement: string;
    backendRouteImport: string;
    backendRouteUse: string;
    libraryImports: string;
  };
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
    formComponent: "",
    listComponent: "",
    detailsComponent: "",
    queries: "",
    mutations: "",
    backendRoutes: "",
  });

  const [showGenerated, setShowGenerated] = useState(false);
  const [uiMode, setUiMode] = useState<"dialog" | "page">("dialog");

  const [parentTableConfig, setParentTableConfig] = useState<TableConfig>({
    displayFields: [],
    searchableFields: [],
    sortableFields: [],
    defaultSort: "",
    defaultSortOrder: "asc",
    pageSize: 10,
    enableSearch: true,
    enablePagination: true,
  });

  const generateBackendFields = (
    parentFields: Field[],
    childFields: Field[]
  ) => {
    // Remove duplicates and filter out invalid fields
    const uniqueParentFields = parentFields.filter(
      (field, index, self) =>
        field.name &&
        field.name.trim() !== "" &&
        self.findIndex((f) => f.name === field.name) === index
    );

    const uniqueChildFields = childFields.filter(
      (field, index, self) =>
        field.name &&
        field.name.trim() !== "" &&
        self.findIndex((f) => f.name === field.name) === index
    );

    return {
      parent: {
        insertFields: uniqueParentFields.map((f) => f.name).join(", "),
        insertPlaceholders: uniqueParentFields
          .map((_, i) => `$${i + 1}`)
          .join(", "),
        selectFields: uniqueParentFields.map((f) => f.name).join(", "),
        updateFields: uniqueParentFields
          .map((f, i) => `${f.name} = $${i + 2}`)
          .join(", "),
      },
      child: {
        insertFields: uniqueChildFields.map((f) => f.name).join(", "),
        insertPlaceholders: uniqueChildFields
          .map((_, i) => `$${i + 1}`)
          .join(", "),
        selectFields: uniqueChildFields.map((f) => f.name).join(", "),
        updateFields: uniqueChildFields
          .map((f, i) => `${f.name} = $${i + 2}`)
          .join(", "),
      },
    };
  };

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

    if (!parentTable.primaryKey) {
      toast.error("Please select the primary key field for the parent table");
      return;
    }

    if (!childTable.primaryKey) {
      toast.error("Please select the primary key field for the child table");
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
      parentEntityLower,
      uiMode
    );
    const formComponent = generateFormComponent(
      parentTable,
      childTable,
      parentEntityUpper,
      parentEntityLower,
      childEntityUpper,
      childEntityLower,
      uiMode
    );
    const listComponent = generateListComponent(
      parentTable,
      parentEntityUpper,
      parentEntityLower,
      childEntityLower,
      uiMode,
      parentTableConfig
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

    const routingHelper = generateRoutingHelper(
      parentEntityUpper,
      parentEntityLower
    );

    setGeneratedCode({
      mainComponent,
      formComponent,
      listComponent,
      detailsComponent,
      queries,
      mutations,
      backendRoutes,
      routingHelper,
    });
    setShowGenerated(true);
  };

  const generateMainComponent = (
    parentEntityUpper: string,
    parentEntityLower: string,
    uiMode: "dialog" | "page"
  ) => {
    return `import React from "react";
import ${parentEntityUpper}Form from "./components/${parentEntityLower}-form";
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
          <${parentEntityUpper}Form setOpen={setOpen} isEdit={false} />
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
            <${parentEntityUpper}Form 
              ${parentEntityLower}Id={selectedParentId} 
              setOpen={setEditOpen} 
              isEdit={true}
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

  const generateFormComponent = (
    parentTable: TableInfo,
    childTable: TableInfo,
    parentEntityUpper: string,
    parentEntityLower: string,
    childEntityUpper: string,
    childEntityLower: string,
    uiMode: "dialog" | "page"
  ) => {
    const componentProps =
      uiMode === "page"
        ? `{
  onCancel,
}: {
  onCancel: () => void;
}`
        : `{
  ${parentEntityLower}Id,
  setOpen,
  isEdit = false,
}: {
  ${parentEntityLower}Id?: number;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEdit?: boolean;
}`;

    const onSuccessAction =
      uiMode === "page" ? "navigate(-1);" : "setOpen(false);";
    const cancelAction = uiMode === "page" ? "navigate(-1)" : "form.reset()";
    const cancelButtonText = uiMode === "page" ? "Cancel" : "Reset";

    const pageWrapper =
      uiMode === "page"
        ? `<div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          {isEdit ? (
            <>
              <Edit className="w-6 h-6 text-primary" />
              <h1 className="text-3xl font-bold text-primary">
                Edit ${parentEntityUpper}
              </h1>
            </>
          ) : (
            <>
              <PackagePlus className="w-6 h-6 text-primary" />
              <h1 className="text-3xl font-bold text-primary">
                Add New ${parentEntityUpper}
              </h1>
            </>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">`
        : `<div className="bg-white rounded-lg p-0">`;

    const pageWrapperEnd =
      uiMode === "page"
        ? `        </div>
      </div>
    </div>`
        : `</div>`;

    const additionalImports = uiMode === "page" ? ", PackagePlus, Edit" : "";

    return `import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
${
  uiMode === "page"
    ? 'import { useSearchParams, useNavigate } from "react-router";'
    : ""
}
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
import { Plus, Trash2${additionalImports} } from "lucide-react";
import { useAdd${parentEntityUpper}Mutation, useUpdate${parentEntityUpper}Mutation } from "../service/mutation";
import { useGet${parentEntityUpper}ById } from "../service/query";
import { toast } from "sonner";

${generateZodSchema(parentTable.fields, parentTable.entityName)}

${generateZodSchema(childTable.fields, childTable.entityName)}

const masterDetailSchema = z.object({
  ${parentEntityLower}: ${parentTable.entityName.toLowerCase()}Schema,
  ${childEntityLower}Items: z.array(${childTable.entityName.toLowerCase()}Schema).min(0, "${childEntityUpper} items are optional"),
});

type MasterDetailFormData = z.infer<typeof masterDetailSchema>;

const ${parentEntityUpper}Form = (${componentProps}) => {
${
  uiMode === "page"
    ? `  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ${parentEntityLower}Id = searchParams.get("id") ? parseInt(searchParams.get("id")!) : undefined;
  const isEdit = !!${parentEntityLower}Id;
`
    : ""
}  const { data: ${parentEntityLower}Data, isLoading } = useGet${parentEntityUpper}ById(${parentEntityLower}Id || 0);
  const { mutate: add${parentEntityUpper}, isPending: isAdding } = useAdd${parentEntityUpper}Mutation();
  const { mutate: update${parentEntityUpper}, isPending: isUpdating } = useUpdate${parentEntityUpper}Mutation();

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

  // Load data for edit mode
  useEffect(() => {
    if (isEdit && ${parentEntityLower}Data) {
      form.reset({
        ${parentEntityLower}: {
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
            .join("\n          ")}
        },
        ${childEntityLower}Items: ${parentEntityLower}Data.${childEntityLower}Items || [],
      });
    }
  }, [isEdit, ${parentEntityLower}Data, form]);

  const onSubmit = async (data: MasterDetailFormData) => {
    try {
      const promise = isEdit 
        ? new Promise((resolve, reject) => {
            update${parentEntityUpper}({ id: ${parentEntityLower}Id!, data }, {
              onSuccess: () => {
                resolve("${parentEntityUpper} updated successfully");
                ${onSuccessAction}
              },
              onError: (error) => reject(error.message),
            });
          })
        : new Promise((resolve, reject) => {
            add${parentEntityUpper}(data, {
              onSuccess: () => {
                form.reset();
                resolve("${parentEntityUpper} added successfully");
                ${onSuccessAction}
              },
              onError: (error) => reject(error.message),
            });
          });

      toast.promise(promise, {
        loading: isEdit ? "Updating ${parentEntityLower}..." : "Adding ${parentEntityLower}...",
        success: isEdit ? "${parentEntityUpper} updated successfully" : "${parentEntityUpper} added successfully",
        error: isEdit ? "Failed to update ${parentEntityLower}" : "Failed to add ${parentEntityLower}",
      });
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

  if (isEdit && isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    ${pageWrapper}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Parent Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isEdit ? "Edit" : "Add"} ${parentEntityUpper} Information
              </CardTitle>
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
                  className="ml-2 bg-primary hover:bg-primary-hover"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add ${childEntityUpper}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fields.length > 0 ? (
                <Table>
                  <TableHeader className="bg-primary text-center border text-white hover:bg-primary-hover hover:text-white">
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
                                    .filter((opt) => opt !== "")
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
                                        "\n                                    "
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
                          .join("\n                        ")}
                        <TableCell>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1 && !isEdit}
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
                  <Button type="button" onClick={addDetailItem} size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First ${childEntityUpper}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              className="cursor-pointer"
              type="button"
              variant="outline"
              onClick={() => ${cancelAction}}
            >
              ${cancelButtonText}
            </Button>
            <Button
              className="cursor-pointer"
              type="submit"
              disabled={form.formState.isSubmitting || isAdding || isUpdating}
            >
              {form.formState.isSubmitting || isAdding || isUpdating
                ? (isEdit ? "Updating..." : "Adding...")
                : (isEdit ? "Update ${parentEntityUpper}" : "Add ${parentEntityUpper}")}
            </Button>
          </div>
        </form>
      </Form>
    ${pageWrapperEnd}
  );
};

export default ${parentEntityUpper}Form;`;
  };

  // Helper function for generating list component
  const generateListComponent = (
    parentTable: TableInfo,
    parentEntityUpper: string,
    parentEntityLower: string,
    childEntityLower: string,
    uiMode: "dialog" | "page",
    tableConfig: TableConfig
  ) => {
    return `import { useState } from "react";
${uiMode === "page" ? 'import { useNavigate } from "react-router";' : ""}
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
${
  tableConfig.enableSearch
    ? 'import { Input } from "@/components/ui/input";'
    : ""
}
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
  const [searchTerm, setSearchTerm] = useState("");
  ${
    tableConfig.sortableFields.length > 0
      ? `const [sortField, setSortField] = useState("${
          tableConfig.defaultSort || tableConfig.sortableFields[0] || ""
        }");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("${
    tableConfig.defaultSortOrder || "asc"
  }");`
      : ""
  }
  const itemsPerPage = ${tableConfig.pageSize || 10};
${uiMode === "page" ? "  const navigate = useNavigate();\n" : ""}
  const {
    data: ${parentEntityLower}Data,
    isLoading,
    error,
  } = useGet${parentEntityUpper}(currentPage, itemsPerPage, searchTerm${
      tableConfig.sortableFields.length > 0 ? ", sortField, sortOrder" : ""
    });

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
    ${
      uiMode === "dialog"
        ? "setEditOpen(true);"
        : `navigate("/${parentEntityLower}s/edit?id=" + id);`
    }
  };

  const handleView = (id: number) => {
    setSelectedParentId(id);
    setDetailsOpen(true);
  };

  ${
    tableConfig.sortableFields.length > 0
      ? `const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };`
      : ""
  }

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
        <Button onClick={() => ${
          uiMode === "dialog"
            ? "setOpen(true)"
            : `navigate("/${parentEntityLower}s/add")`
        }} className="bg-primary hover:bg-primary-hover">
          <Package className="w-4 h-4 mr-2" />
          Add ${parentEntityUpper}
        </Button>
      </CardHeader>
      <CardContent>
        ${
          tableConfig.enableSearch
            ? `<div className="mb-4">
          <Input
            placeholder="Search ${parentEntityLower}s..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>`
            : ""
        }
        <Table>
          <TableHeader className="bg-primary text-center border text-white hover:bg-primary-hover hover:text-white">
            <TableRow>
              ${generateTableHeaders(
                parentTable.fields.filter((f) =>
                  tableConfig.displayFields.includes(f.name)
                )
              )}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {${parentEntityLower}Data?.data?.map((item: any) => (
              <TableRow key={item.${parentTable.primaryKey || "id"}}>
                ${parentTable.fields
                  .filter((field) =>
                    tableConfig.displayFields.includes(field.name)
                  )
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
                      onClick={() => handleView(item.${
                        parentTable.primaryKey || "id"
                      })}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(item.${
                        parentTable.primaryKey || "id"
                      })}
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
                          <AlertDialogAction onClick={() => handleDelete(item.${
                            parentTable.primaryKey || "id"
                          })}>
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

        ${
          tableConfig.enablePagination
            ? `{totalPages > 1 && (
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
        )}`
            : ""
        }
      </CardContent>
    </Card>
  );
};

export default List${parentEntityUpper};`;
  };

  // Helper function for generating details component
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
              <TableHeader className="bg-primary text-center border text-white hover:bg-primary-hover hover:text-white">
                <TableRow>
                  ${generateTableHeaders(childTable.fields)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {${parentEntityLower}Data.${childEntityLower}Items.map((item: any, index: number) => (
                  <TableRow key={item.${
                    childTable.primaryKey || "id"
                  } || index}>
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

// Get all ${parentEntityLower}s with pagination
export const useGet${parentEntityUpper} = (
  page: number = 1, 
  limit: number = 10, 
  search: string = "",
  sortField: string = "",
  sortOrder: "asc" | "desc" = "asc"
) => {
  return useQuery({
    queryKey: ["${parentEntityLower}s", page, limit, search, sortField, sortOrder],
    queryFn: async () => {
      let url = \`\${API_BASE_URL}/${parentEntityLower}s/get-all?page=\${page}&limit=\${limit}\`;
      
      if (search) {
        url += \`&search=\${encodeURIComponent(search)}\`;
      }
      
      if (sortField) {
        url += \`&sortField=\${sortField}&sortOrder=\${sortOrder}\`;
      }
      
      const response = await axios.get(url, {
        withCredentials: true,
      });
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

  // Helper function for generating mutations
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

  // Helper function for generating backend routes
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
    const search = req.query.search || '';
    const sortField = req.query.sortField || '${parentTable.primaryKey || "id"}';
    const sortOrder = req.query.sortOrder || 'asc';

    // Build WHERE clause for search
    let whereClause = '';
    let searchParams = [];
    if (search) {
      const searchableFields = [${parentTable.fields
        .filter(field => field.searchable)
        .map(field => `"${field.name}"`)
        .join(', ')}];
      
      if (searchableFields.length > 0) {
        whereClause = 'WHERE ' + searchableFields.map(field => \`\${field} ILIKE $\${searchParams.length + 1}\`).join(' OR ');
        searchParams.push(\`%\${search}%\`);
      }
    }

    // Get total count
    const countQuery = \`SELECT COUNT(*) FROM ${parentTable.tableName} \${whereClause}\`;
    const countResult = await pool.query(countQuery, searchParams);
    const total = parseInt(countResult.rows[0].count);

    // Get ${parentEntityLower}s with pagination, search, and sorting
    const selectQuery = \`SELECT ${parentTable.primaryKey || "id"},${
      backendFields.parent.selectFields
    } FROM ${parentTable.tableName} \${whereClause} ORDER BY "\${sortField}" \${sortOrder.toUpperCase()} LIMIT $\${searchParams.length + 1} OFFSET $\${searchParams.length + 2}\`;
    
    const queryParams = [...searchParams, limit, offset];
    const result = await pool.query(selectQuery, queryParams);

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
    } WHERE ${parentTable.primaryKey || "id"} = $1',
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
    }) VALUES (${backendFields.parent.insertPlaceholders}) RETURNING ${
      parentTable.primaryKey || "id"
    }',
      [${parentTable.fields
        .map((field: any) => `${parentEntityLower}.${field.name}`)
        .join(", ")}]
    );

    const ${parentEntityLower}Id = ${parentEntityLower}Result.rows[0].${
      parentTable.primaryKey || "id"
    };

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

// PUT /${parentEntityLower}s/update/:id - Update ${parentEntityLower} with ${childEntityLower} items
${parentEntityUpper}.put('/update/:id', async (req, res) => {
  const pool = req.tenantPool;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { ${parentEntityLower}, ${childEntityLower}Items } = req.body;

    // Update ${parentEntityLower}
    const ${parentEntityLower}Result = await client.query(
      'UPDATE ${parentTable.tableName} SET ${
      backendFields.parent.updateFields
    } WHERE ${parentTable.primaryKey || "id"} = $1 RETURNING *',
      [id, ${parentTable.fields
        .map((field: any) => `${parentEntityLower}.${field.name}`)
        .join(", ")}]
    );

    if (${parentEntityLower}Result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: '${parentEntityUpper} not found' });
    }

    // Delete existing ${childEntityLower} items
    await client.query('DELETE FROM ${childTable.tableName} WHERE ${
      childTable.foreignKey
    } = $1', [id]);

    // Insert updated ${childEntityLower} items
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

    await client.query('COMMIT');
    res.json({ 
      id: id, 
      message: '${parentEntityUpper} updated successfully',
      data: ${parentEntityLower}Result.rows[0]
    });
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
    } WHERE ${parentTable.primaryKey || "id"} = $1 RETURNING *', [id]);

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

  const generateRoutingHelper = (
    parentEntityUpper: string,
    parentEntityLower: string
  ) => {
    const libraryImports = `// Required shadcn/ui components
npm install @radix-ui/react-dialog @radix-ui/react-switch @radix-ui/react-radio-group
npm install @radix-ui/react-select @radix-ui/react-label @radix-ui/react-slot
npm install lucide-react react-hook-form @hookform/resolvers zod
npm install @tanstack/react-query axios sonner react-router

// Add these to components.json or install via shadcn/ui CLI:
npx shadcn-ui@latest add button card input label textarea select
npx shadcn-ui@latest add dialog form tabs badge table switch
npx shadcn-ui@latest add radio-group separator scroll-area`;

    const routeImport =
      uiMode === "page"
        ? `import { useNavigate } from "react-router";
import ${parentEntityUpper}Page from "./pages/${parentEntityLower}/${parentEntityLower}-page";
import ${parentEntityUpper}Form from "./pages/${parentEntityLower}/${parentEntityLower}-form";

// Wrapper components for navigation
const ${parentEntityUpper}AddWrapper = () => {
  const navigate = useNavigate();
  return <${parentEntityUpper}Form onCancel={() => navigate(-1)} />;
};

const ${parentEntityUpper}EditWrapper = () => {
  const navigate = useNavigate();
  return <${parentEntityUpper}Form onCancel={() => navigate(-1)} />;
};`
        : `import ${parentEntityUpper}Page from "./pages/${parentEntityLower}/${parentEntityLower}-page";`;

    const routeElement =
      uiMode === "page"
        ? `<Route path="/${parentEntityLower}s" element={<${parentEntityUpper}Page />} />
<Route path="/${parentEntityLower}s/add" element={<${parentEntityUpper}AddWrapper />} />
<Route path="/${parentEntityLower}s/edit" element={<${parentEntityUpper}EditWrapper />} />`
        : `<Route path="/${parentEntityLower}s" element={<${parentEntityUpper}Page />} />`;

    return {
      routeImport,
      routeElement,
      backendRouteImport: `import ${parentEntityUpper}Routes from "./routes/${parentEntityLower}-routes.js";`,
      backendRouteUse: `app.use("/api/v1/${parentEntityLower}s", requireAuth, tenantMiddleware, ${parentEntityUpper}Routes);`,
      libraryImports,
    };
  };

  const replaceFilesMasterDetail = async () => {
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
          filename: `${parentEntityLower}-form.tsx`,
          path: frontendComponentsPath,
          content: generatedCode.formComponent,
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

      // Add routing helpers if they exist
      if (generatedCode.routingHelper) {
        files.push({
          filename: `routing-helpers.txt`,
          path: frontendEntityPath,
          content: `// Frontend Route Import
${generatedCode.routingHelper.routeImport}

// Frontend Route Element  
${generatedCode.routingHelper.routeElement}

// Backend Route Import
${generatedCode.routingHelper.backendRouteImport}

// Backend Route Usage
${generatedCode.routingHelper.backendRouteUse}

// Required Library Imports
${generatedCode.routingHelper.libraryImports}`,
          type: "frontend",
        });
      }

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
            uiMode={uiMode}
            setUiMode={setUiMode}
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

          <TableSettings
            parentTable={parentTable}
            setParentTable={setParentTable}
            parentTableConfig={parentTableConfig}
            setParentTableConfig={setParentTableConfig}
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
