import { cookies } from "next/headers";
import { createClient } from "./utils/supabase/server";
import { NextResponse, NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  // const { data: { session } } = await supabase.auth.getSession();

  const currentPath = request.nextUrl.pathname
  const isAuthPage = currentPath === '/login' || currentPath === '/signup'

  if (!user && !isAuthPage) {
   const loginUrl = new URL('/login', request.url)
    // Opcional: Guardamos la página a la que quería ir para redirigirlo luego de loguearse
    loginUrl.searchParams.set('next', currentPath) 
    return NextResponse.redirect(loginUrl)
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  

  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas de solicitud excepto las que empiezan por:
     * - _next/static (archivos estáticos)
     * - _next/image (imágenes optimizadas de Next.js)
     * - favicon.ico (icono del sitio)
     * - Archivos con extensiones comunes (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}