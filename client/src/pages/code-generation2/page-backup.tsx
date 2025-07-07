import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";
import { toast } from "sonner";

// Import components
import DatabaseIntegration from "./components/DatabaseIntegration";
import ProjectConfiguration from "./components/ProjectConfiguration";
import TableConfiguration from "./components/TableConfiguration";
import CodeDisplay from "./components/CodeDisplay";

// Import utilities
import {
  generateZodSchema,
  generateFormFields,
  generateTableHeaders,
  generateTableCells,
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

  // Parent table state
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

  const [showGenerated, setShowGenerated] = useState(false);

  const generateCode = () => {
    // Validation
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
      listComponent,
      detailsComponent,
      queries,
      mutations,
      backendRoutes,
    });
    setShowGenerated(true);
  };

  // Helper function for generating main component
  const generateMainComponent = (
    parentEntityUpper: string,
    parentEntityLower: string
  ) => {
    return `"use client";

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
import { PackagePlus, Eye } from "lucide-react";

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
  };

  // Helper function for generating add component
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
          .join(",\\n        ")}
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
          .join(",\\n        ")}
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
        .join(",\\n      ")}
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
                <TableHeader>
                  <TableRow>
                    ${generateTableHeaders(childTable.fields)}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      ${generateTableCells(childTable.fields)}
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

  // Helper function for generating list component
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
  setDetailsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedParentId: React.Dispatch<React.SetStateAction<number | null>>;
}

const List${parentEntityUpper} = ({
  setOpen,
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
          <TableHeader>
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
                  .join("\\n                ")}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(item.id)}
                    >
                      <Eye className="h-4 w-4" />
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
              .join("\\n            ")}
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
              <TableHeader>
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
                      .join("\\n                    ")}
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

  // Helper function for generating queries
  const generateQueries = (
    parentEntityUpper: string,
    parentEntityLower: string,
    childEntityUpper: string,
    childEntityLower: string
  ) => {
    return `import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Get all ${parentEntityLower}s with pagination
export const useGet${parentEntityUpper} = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["${parentEntityLower}s", page, limit],
    queryFn: async () => {
      const response = await axios.get(
        \`\${API_BASE_URL}/${parentEntityLower}s?page=\${page}&limit=\${limit}\`
      );
      return response.data;
    },
  });
};

// Get ${parentEntityLower} by ID with ${childEntityLower} items
export const useGet${parentEntityUpper}ById = (id: number) => {
  return useQuery({
    queryKey: ["${parentEntityLower}", id],
    queryFn: async () => {
      const response = await axios.get(\`\${API_BASE_URL}/${parentEntityLower}s/\${id}\`);
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

const API_BASE_URL = "http://localhost:5000/api";

// Add ${parentEntityLower} with ${childEntityLower} items
export const useAdd${parentEntityUpper}Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post(\`\${API_BASE_URL}/${parentEntityLower}s\`, data);
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
      const response = await axios.put(\`\${API_BASE_URL}/${parentEntityLower}s/\${id}\`, data);
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
      const response = await axios.delete(\`\${API_BASE_URL}/${parentEntityLower}s/\${id}\`);
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
    return `const express = require('express');
const router = express.Router();
const pool = require('../config/database'); // Assuming you have a database config

// GET /${parentEntityLower}s - Get all ${parentEntityLower}s with pagination
router.get('/${parentEntityLower}s', async (req, res) => {
  try {
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
      'SELECT ${backendFields.parent.selectFields} FROM ${
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

// GET /${parentEntityLower}s/:id - Get ${parentEntityLower} by ID with ${childEntityLower} items
router.get('/${parentEntityLower}s/:id', async (req, res) => {
  try {
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

// POST /${parentEntityLower}s - Create ${parentEntityLower} with ${childEntityLower} items
router.post('/${parentEntityLower}s', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { ${parentEntityLower}, ${childEntityLower}Items } = req.body;

    // Insert ${parentEntityLower}
    const ${parentEntityLower}Result = await client.query(
      'INSERT INTO ${parentTable.tableName} (${
      backendFields.parent.insertFields
    }) VALUES (${backendFields.parent.insertPlaceholders}) RETURNING id',
      [${backendFields.parent.insertValues}]
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
        [${backendFields.child.insertValues}, ${parentEntityLower}Id]
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

// PUT /${parentEntityLower}s/:id - Update ${parentEntityLower}
router.put('/${parentEntityLower}s/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const setClause = Object.keys(updates)
      .map((key, index) => \`\${key} = $\${index + 2}\`)
      .join(', ');
    
    const values = [id, ...Object.values(updates)];

    const result = await pool.query(
      \`UPDATE ${
        parentTable.tableName
      } SET \${setClause} WHERE id = $1 RETURNING *\`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '${parentEntityUpper} not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating ${parentEntityLower}:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /${parentEntityLower}s/:id - Delete ${parentEntityLower} and associated ${childEntityLower} items
router.delete('/${parentEntityLower}s/:id', async (req, res) => {
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

module.exports = router;`;
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

          <div className="flex justify-center">
            <Button onClick={generateCode} size="lg" className="w-full">
              <Play className="w-5 h-5 mr-2" />
              Generate Master-Detail Code
            </Button>
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
