



import React, { useState } from "react";
import "../styles/OptionTableRow.css";
import OptionEditModal from "./OptionEditModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

export interface ProductOption {
    id: string;
    name: string;
    description: string;
    PA: number;
    PV: number;
    Marge: number;
}

interface OptionTableRowProps {
    option: ProductOption;
    selectedOptions: Set<string>;
    onToggle: (optionId: string) => void;
    onUpdateOption: (optionId: string, updates: Partial<ProductOption>) => void;
}

const OptionTableRow: React.FC<OptionTableRowProps> = ({
    option,
    onUpdateOption,
}) => {
    const [showModal, setShowModal] = useState(false);

    const handleSave = (updates: Partial<ProductOption>) => {
        onUpdateOption(option.id, updates);
        setShowModal(false);
    };

    return (
        <>
            <tr className="option-row">
                <td className="option-row_td">{option.name}</td>
                <td className="option-description option-row_td">{option.description}</td>
                <td>{option.PA.toFixed(2)} €</td>
                <td>{option.Marge.toFixed(0)} %</td>
                <td className="price-impact">{option.PV.toFixed(2)} €</td>
                <td>

                    <FontAwesomeIcon
                        onClick={() => setShowModal(true)}
                        icon={faEdit}
                        style={{ color: "#505151", display: "flex", margin: "auto", cursor: "pointer", opacity: "0.5" }}
                    />
                </td>
            </tr>

            {showModal && (
                <OptionEditModal
                    option={option}
                    onSave={handleSave}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
};

export default OptionTableRow;
