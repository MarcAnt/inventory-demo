// components/ui/data-table-search.tsx
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

interface DataTableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}
function DataTableSearch({
  value,
  onChange,
  placeholder = "Filtrar...",
  disabled,
}: DataTableSearchProps) {
  return (
    <div className="relative flex items-center">
      <SearchIcon className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8"
        disabled={disabled}
      />
    </div>
  );
}

export default DataTableSearch;
