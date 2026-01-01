import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface FilterState {
    sculptureType: string[];
    roomType: string[];
    style: string[];
}

interface FilterOptions {
    sculptureType: string[];
    roomType: string[];
    style: string[];
}

interface FilterLabels {
    sculptureType?: string;
    roomType?: string;
    style?: string;
}

interface FilterPanelProps {
    filters: FilterState;
    onFilterChange: (category: keyof FilterState, value: string) => void;
    onClearFilters: () => void;
    className?: string;
    filterOptions?: FilterOptions;
    labels?: FilterLabels;
}

// No hardcoded defaults - only database values
const defaultLabels: FilterLabels = {
    sculptureType: "Sculpture Type",
    roomType: "Room",
    style: "Style"
};

const FilterPanel = ({ 
    filters, 
    onFilterChange, 
    onClearFilters, 
    className,
    filterOptions,
    labels = defaultLabels
}: FilterPanelProps) => {
    // Build categories from database values only - no fallbacks
    const categories = [
        {
            id: "sculptureType" as const,
            label: labels.sculptureType || defaultLabels.sculptureType,
            options: filterOptions?.sculptureType || []
        },
        {
            id: "roomType" as const,
            label: labels.roomType || defaultLabels.roomType,
            options: filterOptions?.roomType || []
        },
        {
            id: "style" as const,
            label: labels.style || defaultLabels.style,
            options: filterOptions?.style || []
        }
    ].filter(cat => cat.options.length > 0); // Only show categories with options

    const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

    return (
        <div className={className}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-medium text-luxury-charcoal">Filters</h3>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                        className="text-xs text-muted-foreground hover:text-luxury-gold h-auto p-0"
                    >
                        Clear all
                    </Button>
                )}
            </div>

            <Accordion type="multiple" defaultValue={["sculptureType", "roomType"]} className="w-full">
                {categories.map((category) => (
                    <AccordionItem key={category.id} value={category.id} className="border-b-luxury-charcoal/10">
                        <AccordionTrigger className="text-sm font-medium hover:text-luxury-gold hover:no-underline py-4">
                            {category.label}
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-3 pt-1 pb-4">
                                {category.options.map((option) => {
                                    const isChecked = filters[category.id].includes(option);
                                    return (
                                        <div key={option} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`${category.id}-${option}`}
                                                checked={isChecked}
                                                onCheckedChange={() => onFilterChange(category.id, option)}
                                                className="border-luxury-charcoal/30 data-[state=checked]:bg-luxury-gold data-[state=checked]:border-luxury-gold"
                                            />
                                            <Label
                                                htmlFor={`${category.id}-${option}`}
                                                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {option}
                                            </Label>
                                        </div>
                                    );
                                })}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};

export default FilterPanel;
