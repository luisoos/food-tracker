import { MealType } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";

export default function MealSelector() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Deine Mahlzeiten</CardTitle>
                <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4">
                    <Meal typeName="Frühstück" type={MealType.BREAKFAST} />
                    <Meal typeName="Mittagessen" type={MealType.LUNCH} />
                    <Meal typeName="Abendessen" type={MealType.DINNER} />
                </div>
            </CardContent>
        </Card>
    );
}

function Meal({ typeName, type }: { typeName: string, type: MealType }) {
    return (
        <div className="align-center" key={type}>
            <div className="rounded border shadow">
                
            </div>
            <p>{ typeName }</p>
        </div>
    )
}