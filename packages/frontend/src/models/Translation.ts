import { Language } from "./Language";

export interface Translation {
    translationKey: string;
    language: Partial<Language>;
    value: string;
}
