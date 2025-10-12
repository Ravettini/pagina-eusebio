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
  const mxEnabled = process.env.NEXT_PUBLIC_ENABLE_MX_CHECK === "true";

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

        <div className="flex items-center justify-between space-x-2">
          <Label
            htmlFor="check-mx"
            className={`flex flex-col gap-1 ${!mxEnabled ? "opacity-50" : ""}`}
          >
            <span className="font-medium">Verificar registro MX</span>
            <span className="text-xs font-normal text-muted-foreground">
              {mxEnabled
                ? "Validar que el dominio tenga servidor de correo"
                : "Deshabilitado (requiere configuración del servidor)"}
            </span>
          </Label>
          <Switch
            id="check-mx"
            checked={params.checkMX && mxEnabled}
            onCheckedChange={(checked) => onChange({ ...params, checkMX: checked })}
            disabled={!mxEnabled}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="check-antiquity" className="flex flex-col gap-1 opacity-50">
            <span className="font-medium">Considerar antigüedad</span>
            <span className="text-xs font-normal text-muted-foreground">
              Informativo: marcar emails con más de 12 meses
            </span>
          </Label>
          <Switch
            id="check-antiquity"
            checked={params.checkAntiquity}
            onCheckedChange={(checked) => onChange({ ...params, checkAntiquity: checked })}
            disabled={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}




