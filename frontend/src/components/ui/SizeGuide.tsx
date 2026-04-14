import React from "react";

type Props = {
    show: boolean;
    onClose: () => void;
};

const SizeGuide: React.FC<Props> = ({ show, onClose }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-[var(--current-bg)] p-4 rounded w-11/12 md:w-1/2">
                <button onClick={onClose} className="absolute top-2 right-2 text-red-500 font-bold">X</button>
                <h2 className="text-xl font-bold mb-2">Size Guide</h2>
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-[var(--current-border)]">
                            <th className="border px-2 py-1">Size</th>
                            <th className="border px-2 py-1">Chest (in)</th>
                            <th className="border px-2 py-1">Waist (in)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td className="border px-2 py-1">S</td><td className="border px-2 py-1">34-36</td><td className="border px-2 py-1">28-30</td></tr>
                        <tr><td className="border px-2 py-1">M</td><td className="border px-2 py-1">38-40</td><td className="border px-2 py-1">32-34</td></tr>
                        <tr><td className="border px-2 py-1">L</td><td className="border px-2 py-1">42-44</td><td className="border px-2 py-1">36-38</td></tr>
                        <tr><td className="border px-2 py-1">XL</td><td className="border px-2 py-1">46-48</td><td className="border px-2 py-1">40-42</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SizeGuide;