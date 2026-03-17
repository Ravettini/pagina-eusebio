"use client";

import { Settings } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card className="border-0 bg-[#131313] text-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-[#7bd0ff]" />
          <CardTitle className="text-sm font-semibold tracking-tight">
            Parámetros de validación
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-white">
          Configurá las reglas de validación para tu lista
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="allow-roles" className="flex flex-col gap-1">
            <span className="text-sm font-medium text-white">
              Permitir correos de rol
            </span>
            <span className="text-xs font-normal text-white">
              Incluir emails como info@, ventas@, contacto@ (Doppler recomienda evitarlos)
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
            <span className="text-sm font-medium text-white">Solo Latinoamérica</span>
            <span className="text-xs font-normal text-white">
              Filtrar emails fuera de Latinoamérica (.ar, .mx, .co, .cl, etc.)
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




