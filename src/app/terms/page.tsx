'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowUp } from 'lucide-react';

export default function TermsPage() {
    const router = useRouter();

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <main className="min-h-screen bg-background p-4 md:p-8">
            <div className="mx-auto max-w-4xl">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/login')}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl">Términos y Condiciones de Uso</CardTitle>
                        <p className="text-sm text-muted-foreground">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </CardHeader>
                    <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold mb-3">1. Aceptación de los Términos</h2>
                            <p className="text-muted-foreground">
                                Al acceder y utilizar ALAN (Anti-Light-Pollution Action Network), usted acepta estar sujeto a estos Términos y Condiciones de Uso, todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de todas las leyes locales aplicables. Si no está de acuerdo con alguno de estos términos, tiene prohibido usar o acceder a esta aplicación.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">2. Descripción del Servicio</h2>
                            <p className="text-muted-foreground">
                                ALAN es una plataforma ciudadana para mapear y reportar la contaminación lumínica en diferentes ubicaciones. Los usuarios pueden:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                                <li>Subir observaciones con fotografías y descripciones</li>
                                <li>Valorar la calidad de iluminación de ubicaciones específicas</li>
                                <li>Ver observaciones de otros usuarios en un mapa interactivo</li>
                                <li>Participar en la comunidad votando y reportando observaciones</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">3. Registro y Cuenta de Usuario</h2>
                            <p className="text-muted-foreground">
                                Para utilizar ALAN, debe autenticarse mediante Google OAuth. Al registrarse, usted garantiza que:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                                <li>Toda la información proporcionada es precisa y actualizada</li>
                                <li>Es mayor de edad según las leyes de su jurisdicción</li>
                                <li>No utilizará la cuenta para fines ilegales o no autorizados</li>
                                <li>Es responsable de mantener la confidencialidad de su cuenta</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">4. Contenido del Usuario</h2>
                            <p className="text-muted-foreground">
                                Al subir contenido a ALAN (fotografías, descripciones, valoraciones), usted:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                                <li>Conserva todos los derechos de propiedad sobre su contenido</li>
                                <li>Concede a ALAN una licencia mundial, no exclusiva y libre de regalías para usar, mostrar y distribuir su contenido dentro de la plataforma</li>
                                <li>Garantiza que posee los derechos necesarios sobre el contenido que sube</li>
                                <li>Se compromete a no subir contenido ofensivo, difamatorio, obsceno o ilegal</li>
                                <li>Acepta que el contenido puede ser eliminado si viola estas políticas</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">5. Privacidad y Datos Personales</h2>
                            <p className="text-muted-foreground">
                                ALAN recopila y procesa datos personales de acuerdo con nuestra Política de Privacidad:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                                <li>Información de perfil de Google (nombre, email, foto de perfil)</li>
                                <li>Ubicaciones GPS de las observaciones que suba</li>
                                <li>Fotografías y descripciones que proporcione</li>
                                <li>Valoraciones y reportes que realice</li>
                            </ul>
                            <p className="text-muted-foreground mt-2">
                                Los datos de ubicación GPS son necesarios para el funcionamiento de la aplicación y se mostrarán públicamente asociados a sus observaciones. No compartimos su información personal con terceros excepto según lo requerido por ley.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">6. Conducta del Usuario</h2>
                            <p className="text-muted-foreground">
                                Al usar ALAN, usted se compromete a:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                                <li>Proporcionar observaciones precisas y veraces</li>
                                <li>Respetar a otros usuarios y sus contribuciones</li>
                                <li>No manipular valoraciones o reportes de manera fraudulenta</li>
                                <li>No intentar acceder a cuentas de otros usuarios</li>
                                <li>No utilizar la plataforma para spam o publicidad no solicitada</li>
                                <li>No realizar actividades que puedan dañar o sobrecargar la infraestructura de ALAN</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">7. Sistema de Valoraciones y Reportes</h2>
                            <p className="text-muted-foreground">
                                Los usuarios pueden valorar observaciones de otros usuarios en una escala de 1 a 5 estrellas. Cada usuario puede votar una vez por observación, pudiendo cambiar su voto posteriormente. El sistema de reportes permite a los usuarios señalar contenido inapropiado. ALAN se reserva el derecho de revisar y eliminar contenido reportado.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">8. Propiedad Intelectual</h2>
                            <p className="text-muted-foreground">
                                El código, diseño, logotipo y demás elementos de ALAN están protegidos por derechos de propiedad intelectual. El uso de la plataforma no le otorga ningún derecho de propiedad sobre estos elementos, excepto sobre el contenido que usted suba.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">9. Eliminación de Contenido</h2>
                            <p className="text-muted-foreground">
                                Los usuarios pueden eliminar sus propias observaciones en cualquier momento. ALAN también se reserva el derecho de eliminar contenido que:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                                <li>Viole estos términos y condiciones</li>
                                <li>Contenga información falsa o engañosa</li>
                                <li>Sea ofensivo o inapropiado</li>
                                <li>Infrinja derechos de terceros</li>
                                <li>Reciba múltiples reportes de la comunidad</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">10. Limitación de Responsabilidad</h2>
                            <p className="text-muted-foreground">
                                ALAN se proporciona "tal cual" sin garantías de ningún tipo. No garantizamos que:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                                <li>El servicio esté disponible ininterrumpidamente o libre de errores</li>
                                <li>La información proporcionada por usuarios sea precisa o completa</li>
                                <li>Se cumplan expectativas específicas de resultados</li>
                            </ul>
                            <p className="text-muted-foreground mt-2">
                                En ningún caso ALAN será responsable por daños directos, indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso de la plataforma.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">11. Modificaciones del Servicio</h2>
                            <p className="text-muted-foreground">
                                ALAN se reserva el derecho de modificar o discontinuar el servicio (o cualquier parte del mismo) de forma temporal o permanente, con o sin previo aviso. No seremos responsables ante usted ni ante terceros por cualquier modificación, suspensión o discontinuación del servicio.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">12. Modificaciones de los Términos</h2>
                            <p className="text-muted-foreground">
                                Nos reservamos el derecho de actualizar estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en esta página. Su uso continuado de ALAN después de cualquier modificación constituye su aceptación de los nuevos términos.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">13. Terminación</h2>
                            <p className="text-muted-foreground">
                                Podemos terminar o suspender su acceso a ALAN inmediatamente, sin previo aviso ni responsabilidad, por cualquier motivo, incluida, entre otras, la violación de estos Términos y Condiciones. Todas las disposiciones de los Términos que por su naturaleza deban sobrevivir a la terminación, lo harán.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">14. Ley Aplicable</h2>
                            <p className="text-muted-foreground">
                                Estos Términos se regirán e interpretarán de acuerdo con las leyes aplicables en su jurisdicción, sin dar efecto a ningún principio de conflicto de leyes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">15. Contacto</h2>
                            <p className="text-muted-foreground">
                                Si tiene alguna pregunta sobre estos Términos y Condiciones, puede contactarnos a través de la plataforma ALAN.
                            </p>
                        </section>

                        <div className="mt-8 pt-6 border-t">
                            <p className="text-sm text-muted-foreground italic">
                                Al hacer clic en "Acepto los términos y condiciones" en la página de inicio de sesión, usted reconoce que ha leído, entendido y acepta estar sujeto a estos Términos y Condiciones de Uso.
                            </p>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                variant="outline"
                                onClick={() => router.push('/login')}
                                className="w-full sm:w-auto"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver al inicio de sesión
                            </Button>
                            <Button
                                variant="outline"
                                onClick={scrollToTop}
                                className="w-full sm:w-auto"
                            >
                                <ArrowUp className="mr-2 h-4 w-4" />
                                Ir al inicio de la página
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
