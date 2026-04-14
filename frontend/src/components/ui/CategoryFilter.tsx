import React from "react"

type Props = {
    categories: string[]
    selected: string
    onChange: (category: string) => void
}

const CategoryFilter: React.FC<Props> = ({
    categories,
    selected,
    onChange
}) => {
    return (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => onChange(cat)}
                    style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        border: "none",
                        background: selected === cat ? "var(--current-accent)" : "var(--current-surface)",
                        color: "var(--current-text)",
                        cursor: "pointer"
                    }}
                >
                    {cat}
                </button>
            ))}
        </div>
    )
}

export default CategoryFilter