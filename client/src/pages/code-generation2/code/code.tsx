export const generateCode = ({
    parentTable,
    childTable,
}) => {
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
