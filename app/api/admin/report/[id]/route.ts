import { NextRequest } from 'next/server';
import connectDB from "@/config/db";
import Report from "@/models/Report";
import { verifyToken, isAdmin } from "@/utils/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = req.cookies.get("token")?.value || '';
    const payload = verifyToken(token);
    if (!payload || !isAdmin(payload)) {
      return new Response("Unauthorized", { status: 403 });
    }

    const id = req.url.split('/').pop();
    const report = await Report.findById(id);
    if (!report) {
      return new Response("Report not found", { status: 404 });
    }

    return Response.json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const token = req.cookies.get("token")?.value || '';
    const payload = verifyToken(token);
    if (!payload || !isAdmin(payload)) {
      return new Response("Unauthorized", { status: 403 });
    }

    const id = req.url.split('/').pop();
    const updateData = await req.json();
    const updated = await Report.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      return new Response("Report not found", { status: 404 });
    }

    return Response.json(updated);
  } catch (error) {
    console.error("Error updating report:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const token = req.cookies.get("token")?.value || '';
    const payload = verifyToken(token);
    if (!payload || !isAdmin(payload)) {
      return new Response("Unauthorized", { status: 403 });
    }

    const id = req.url.split('/').pop();
    const deleted = await Report.findByIdAndDelete(id);
    if (!deleted) {
      return new Response("Report not found", { status: 404 });
    }

    return new Response("Report deleted", { status: 200 });
  } catch (error) {
    console.error("Error deleting report:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
