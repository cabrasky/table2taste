import { useParams, useSearchParams } from "react-router-dom";
import CategoryForm from "../../../components/Category/CategoryForm";
import { useEffect, useState } from "react";

export const CategoryFormPage: React.FC = () => {
    const {id} = useParams();
    const [searchParams] = useSearchParams();
    const [parentCategoryId, setParentCategoryId] = useState<string|undefined>();

    useEffect(() => {
        const parentCategoryIdParam = searchParams.get("parentCategoryId") 
        setParentCategoryId(parentCategoryIdParam || undefined)
    }, [searchParams])


    return (
        <CategoryForm categoryId={id} defaultParentCategoryId={parentCategoryId} />
    )
}