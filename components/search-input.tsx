// components/ui/data-table-search.tsx
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

interface DataTableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
function DataTableSearch({
  value,
  onChange,
  placeholder = "Filtrar...",
}: DataTableSearchProps) {
  return (
    <div className="relative flex items-center">
      <SearchIcon className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8"
      />
    </div>
  );
}

export default DataTableSearch;
