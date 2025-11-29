import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ControlsBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  window: number;
  onWindowChange: (value: number) => void;
  seasonality: number;
  onSeasonalityChange: (value: number) => void;
  coverageDays: number;
  onCoverageDaysChange: (value: number) => void;
  onRecalculate: () => void;
}

export function ControlsBar({
  searchTerm,
  onSearchChange,
  category,
  onCategoryChange,
  window,
  onWindowChange,
  seasonality,
  onSeasonalityChange,
  coverageDays,
  onCoverageDaysChange,
  onRecalculate,
}: ControlsBarProps) {
  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-2">
          <Label htmlFor="search">Buscar produto</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="SKU ou nome..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="category">Categoria</Label>
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Matéria-prima">Matéria-prima</SelectItem>
              <SelectItem value="Ferramenta">Ferramenta</SelectItem>
              <SelectItem value="Consumível">Consumível</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="window">Janela (dias)</Label>
          <Select
            value={window.toString()}
            onValueChange={(v) => onWindowChange(Number(v))}
          >
            <SelectTrigger id="window">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="60">60 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="seasonality">Sazonalidade (%)</Label>
          <Select
            value={seasonality.toString()}
            onValueChange={(v) => onSeasonalityChange(Number(v))}
          >
            <SelectTrigger id="seasonality">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-20">-20%</SelectItem>
              <SelectItem value="-10">-10%</SelectItem>
              <SelectItem value="0">0% (normal)</SelectItem>
              <SelectItem value="10">+10%</SelectItem>
              <SelectItem value="20">+20%</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="coverage">Cobertura extra</Label>
          <Select
            value={coverageDays.toString()}
            onValueChange={(v) => onCoverageDaysChange(Number(v))}
          >
            <SelectTrigger id="coverage">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Sem cobertura</SelectItem>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="14">14 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={onRecalculate}>Recalcular</Button>
      </div>
    </Card>
  );
}
