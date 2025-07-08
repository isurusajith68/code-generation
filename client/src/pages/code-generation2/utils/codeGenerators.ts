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

export const generateZodSchema = (fields: Field[], entityName: string) => {
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
            field.required ? '.min(1, "Selection is required")' : ".optional()"
          }`;
          break;
        case "radio":
          zodType = `z.string()${
            field.required ? '.min(1, "Selection is required")' : ".optional()"
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

export const generateFormFields = (fields: Field[]) => {
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

export const generateTableHeaders = (fields: Field[]) => {
  return fields
    .map(
      (field) =>
        `<TableHead className="text-center text-white">${field.label}</TableHead>`
    )
    .join("\n                      ");
};

export const generateTableCells = (fields: Field[]) => {
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

export const generateBackendFields = (
  parentFields: Field[],
  childFields: Field[]
) => {
  // Parent fields
  const parentSelectFields = parentFields.map((f) => f.name).join(", ");
  const parentInsertFields = parentFields.map((f) => f.name).join(", ");
  const parentInsertPlaceholders = parentFields
    .map((_, i) => `$${i + 1}`)
    .join(", ");
  const parentInsertValues = parentFields.map((f) => f.name).join(", ");

  // Child fields
  const childSelectFields = childFields.map((f) => f.name).join(", ");
  const childInsertFields = childFields.map((f) => f.name).join(", ");
  const childInsertPlaceholders = childFields
    .map((_, i) => `$${i + 1}`)
    .join(", ");
  const childInsertValues = childFields.map((f) => f.name).join(", ");

  const childUpdateFields = childFields
    .map((f, i) => `${f.name} = $${i + 1}`)
    .join(", ");
  const childUpdatePlaceholders = childFields.map((f) => f.name).join(", ");

  return {
    parent: {
      selectFields: parentSelectFields,
      insertFields: parentInsertFields,
      insertPlaceholders: parentInsertPlaceholders,
      insertValues: parentInsertValues,
    },
    child: {
      selectFields: childSelectFields,
      insertFields: childInsertFields,
      insertPlaceholders: childInsertPlaceholders,
      insertValues: childInsertValues,
      updateFields: childUpdateFields,
      updatePlaceholders: childUpdatePlaceholders,
    },
  };
};
