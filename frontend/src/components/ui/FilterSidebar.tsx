import React from "react";

type Props = {
    selectedCategory?: string;
    onCategoryChange?: (category: string) => void;
};

const FilterSidebar = ({ selectedCategory, onCategoryChange }: Props) => {
    const categories = ["All", "Men", "Women", "Kids"];

    return (
        <div className="bg-[var(--current-bg)] p-4 rounded shadow-[var(--current-shadow)]">
            <h3 className="font-bold mb-2">Categories</h3>

            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => onCategoryChange?.(cat)}
                    className={`block w-full text-left p-2 rounded mb-1 ${selectedCategory === cat ? "bg-indigo-600 text-white" : "bg-[var(--current-border)]"
                        }`}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
};

export default FilterSidebar;