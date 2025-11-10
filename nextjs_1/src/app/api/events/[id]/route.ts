import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-url";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get("authorization");
    const apiUrl = await getApiUrl();
    
    const response = await fetch(`${apiUrl}/events/${id}`, {
      method: "GET",
      headers: {
        ...(token && { Authorization: token }),
      },
    });

    const data = await response.text();
    const jsonData = data ? JSON.parse(data) : null;

    return NextResponse.json(jsonData, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error al obtener evento" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get("authorization");
    const body = await request.json();
    const apiUrl = await getApiUrl();
    
    const response = await fetch(`${apiUrl}/events/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: token }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.text();
    const jsonData = data ? JSON.parse(data) : null;

    return NextResponse.json(jsonData, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error al actualizar evento" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get("authorization");
    const apiUrl = await getApiUrl();
    
    const response = await fetch(`${apiUrl}/events/${id}`, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: token }),
      },
    });

    const data = await response.text();
    const jsonData = data ? JSON.parse(data) : null;

    return NextResponse.json(jsonData, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error al eliminar evento" },
      { status: 500 }
    );
  }
}

