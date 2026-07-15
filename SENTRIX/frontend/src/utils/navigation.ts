import { router } from 'expo-router';

/** router.back() sin historial dispara "GO_BACK not handled by any navigator"
 *  (recarga de pagina en web, deep link directo a la ruta). Cae a `fallback`. */
export function goBack(fallback: string) {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback as any);
  }
}
