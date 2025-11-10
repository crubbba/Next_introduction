import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-url";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const apiUrl = await getApiUrl();
    
    const url = userId 
      ? `${apiUrl}/registrations?userId=${encodeURIComponent(userId)}`
      : `${apiUrl}/registrations`;
    
    const response = await fetch(url, {
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
      { message: error instanceof Error ? error.message : "Error al obtener registros" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    const body = await request.json();
    const apiUrl = await getApiUrl();
    
    const response = await fetch(`${apiUrl}/registrations`, {
      method: "POST",
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
      { message: error instanceof Error ? error.message : "Error al crear registro" },
      { status: 500 }
    );
  }
}

