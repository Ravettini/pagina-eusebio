"use client";

import { Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ValidationParamsProps {
  params: {
    allowRoleEmails: boolean;
    filterNonTargetTLDs: boolean;
    checkMX: boolean;
    checkAntiquity: boolean;
  };
  onChange: (params: any) => void;
}

export function ValidationParams({ params, onChange }: ValidationParamsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-gcba-blue" />
          <CardTitle className="text-lg">Parámetros de validación</CardTitle>
        </div>
        <CardDescription>Configurá las reglas de validación para tu lista</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="allow-roles" className="flex flex-col gap-1">
            <span className="font-medium">Permitir correos de rol</span>
            <span className="text-xs font-normal text-muted-foreground">
              Incluir emails como info@, ventas@, contacto@
            </span>
          </Label>
          <Switch
            id="allow-roles"
            checked={params.allowRoleEmails}
            onCheckedChange={(checked) => onChange({ ...params, allowRoleEmails: checked })}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="filter-tlds" className="flex flex-col gap-1">
            <span className="font-medium">Filtrar TLDs fuera del target</span>
            <span className="text-xs font-normal text-muted-foreground">
              Sólo permitir dominios .ar, .com, .net, etc.
            </span>
          </Label>
          <Switch
            id="filter-tlds"
            checked={params.filterNonTargetTLDs}
            onCheckedChange={(checked) => onChange({ ...params, filterNonTargetTLDs: checked })}
          />
        </div>
      </CardContent>
    </Card>
  );
}




