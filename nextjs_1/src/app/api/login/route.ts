import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-url";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiUrl = await getApiUrl();
    
    const response = await fetch(`${apiUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.text();
    const jsonData = data ? JSON.parse(data) : null;

    return NextResponse.json(jsonData, { status: response.status });
  } catch (error) {
    console.error("Error en /api/login:", error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : "Error en login"
      },
      { status: 500 }
    );
  }
}

