import { Outlet } from "react-router-dom"
import { TopMenu } from "../components/TopMenu/TopMenu"


export const MainPageLayout: React.FC = () => {
    return (
        <>
            <TopMenu />
            <main>
                <Outlet/>
            </main>
        </>
    )
}