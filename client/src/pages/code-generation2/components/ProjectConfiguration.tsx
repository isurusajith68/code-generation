import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings } from "lucide-react";

interface ProjectConfigurationProps {
  projectName: string;
  setProjectName: (name: string) => void;
  frontendPath: string;
  setFrontendPath: (path: string) => void;
  backendRoutePath: string;
  setBackendRoutePath: (path: string) => void;
  uiMode: "dialog" | "page";
  setUiMode: (mode: "dialog" | "page") => void;
}

const ProjectConfiguration: React.FC<ProjectConfigurationProps> = ({
  projectName,
  setProjectName,
  frontendPath,
  setFrontendPath,
  backendRoutePath,
  setBackendRoutePath,
  uiMode,
  setUiMode,
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <CardTitle>Project Configuration</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Project Name</Label>
            <Input
              placeholder="My Project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <div>
            <Label>Frontend Path</Label>
            <Input
              placeholder="D:\ceyinfo\Hotel-ERP-Repo\v1\hotel-property-module - v1\src\app"
              value={frontendPath}
              onChange={(e) => setFrontendPath(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <div>
            <Label>Backend Route Path</Label>
            <Input
              placeholder="D:\ceyinfo\Hotel-ERP-Repo\v1\hotel-property-module - v1\src\routes"
              value={backendRoutePath}
              onChange={(e) => setBackendRoutePath(e.target.value)}
            />
          </div>
          <div>
            <Label>UI Mode</Label>
            <Select value={uiMode} onValueChange={setUiMode}>
              <SelectTrigger>
                <SelectValue placeholder="Select UI mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dialog">Dialog (Popup)</SelectItem>
                <SelectItem value="page">Page Navigation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectConfiguration;
