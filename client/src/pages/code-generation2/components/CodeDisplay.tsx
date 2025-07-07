import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, FileText, Code, Database } from "lucide-react";
import { toast } from "sonner";

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

interface CodeDisplayProps {
  generatedCode: GeneratedCode;
  projectName?: string;
  parentTable: TableInfo;
}

interface TableInfo {
  tableName: string;
  entityName: string;
  fields: Field[];
  foreignKey?: string;
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

const CodeDisplay: React.FC<CodeDisplayProps> = ({
  generatedCode,
  projectName: _projectName,
  parentTable,
}) => {
  // projectName is for future functionality
  void _projectName;
  const parentEntityName = parentTable.entityName;
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

  const codeFiles = [
    {
      id: "main",
      title: "Main Component",
      filename: `${parentEntityName.toLowerCase()}-page.tsx`,
      content: generatedCode.mainComponent,
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: "add",
      title: "Add Component",
      filename: `add-${parentEntityName.toLowerCase()}.tsx`,
      content: generatedCode.addComponent,
      icon: <Code className="w-4 h-4" />,
    },
    {
      id: "edit",
      title: "Edit Component",
      filename: `edit-${parentEntityName.toLowerCase()}.tsx`,
      content: generatedCode.editComponent,
      icon: <Code className="w-4 h-4" />,
    },
    {
      id: "list",
      title: "List Component",
      filename: `list-${parentEntityName.toLowerCase()}.tsx`,
      content: generatedCode.listComponent,
      icon: <Code className="w-4 h-4" />,
    },
    {
      id: "details",
      title: "Details Component",
      filename: `${parentEntityName.toLowerCase()}-details.tsx`,
      content: generatedCode.detailsComponent,
      icon: <Code className="w-4 h-4" />,
    },
    {
      id: "queries",
      title: "React Query Hooks",
      filename: "query.ts",
      content: generatedCode.queries,
      icon: <Code className="w-4 h-4" />,
    },
    {
      id: "mutations",
      title: "Mutation Hooks",
      filename: "mutation.ts",
      content: generatedCode.mutations,
      icon: <Code className="w-4 h-4" />,
    },
    {
      id: "backend",
      title: "Backend Routes",
      filename: `${parentEntityName.toLowerCase()}-routes.js`,
      content: generatedCode.backendRoutes,
      icon: <Database className="w-4 h-4" />,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Code</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="main" className="w-full">
          <TabsList className="grid w-full grid-cols-8 mb-4">
            {codeFiles.map((file) => (
              <TabsTrigger key={file.id} value={file.id} className="text-xs">
                {file.icon}
                <span className="ml-1 hidden sm:inline">{file.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {codeFiles.map((file) => (
            <TabsContent key={file.id} value={file.id}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{file.title}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(file.content)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(file.content, file.filename)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-96 overflow-y-auto">
                    <code>{file.content}</code>
                  </pre>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CodeDisplay;
