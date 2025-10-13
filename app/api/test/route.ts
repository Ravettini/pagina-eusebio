import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.error("[TEST] ===== TEST API =====");
    console.error("[TEST] Content-Type:", req.headers.get("content-type"));
    console.error("[TEST] Content-Length:", req.headers.get("content-length"));
    
    const formData = await req.formData();
    console.error("[TEST] FormData recibido");
    console.error("[TEST] FormData keys:", Array.from(formData.keys()));
    
    const file = formData.get("file") as File;
    console.error("[TEST] Archivo recibido:", file?.name, file?.size);
    
    return NextResponse.json({
      success: true,
      message: "Test exitoso",
      fileReceived: !!file,
      fileName: file?.name,
      fileSize: file?.size
    });
  } catch (error: any) {
    console.error("[TEST ERROR]:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
