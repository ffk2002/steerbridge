import { NextResponse } from "next/server";
import { withAction } from "@/lib/api-utils";
import { handleGetStayDetails } from "@/lib/managers/stay-manager";

export const GET = withAction<{ id: string }>(async (_request, { params, logger: actionLogger }) => {
    const { id } = await params;

    // Delegate to Manager
    const stayDetails = await handleGetStayDetails(id, actionLogger);

    if (!stayDetails) {
        actionLogger.warn({ stay_id: id }, "Stay not found");
        return NextResponse.json({ error: "Stay not found" }, { status: 404 });
    }

    return NextResponse.json({
        stay: stayDetails,
    });
}, { requireCsrf: false });
