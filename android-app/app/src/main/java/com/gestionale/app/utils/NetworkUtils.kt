package com.gestionale.app.utils

import retrofit2.Response

/**
 * Helper function to safely handle API responses
 */
suspend fun <T> safeApiCall(
    apiCall: suspend () -> Response<T>
): Resource<T> {
    return try {
        val response = apiCall()
        if (response.isSuccessful) {
            response.body()?.let {
                Resource.Success(it)
            } ?: Resource.Error("Risposta vuota dal server")
        } else {
            val errorMessage = when (response.code()) {
                401 -> "Non autorizzato. Effettua nuovamente il login."
                403 -> "Accesso negato"
                404 -> "Risorsa non trovata"
                422 -> "Dati non validi. Verifica i campi inseriti."
                500 -> "Errore del server"
                503 -> "Servizio temporaneamente non disponibile"
                else -> "Errore HTTP ${response.code()}: ${response.message()}"
            }
            Resource.Error(errorMessage)
        }
    } catch (e: java.net.UnknownHostException) {
        Resource.Error("Impossibile raggiungere il server. Verifica la connessione Internet.")
    } catch (e: java.net.SocketTimeoutException) {
        Resource.Error("Timeout: il server non risponde. Riprova tra qualche secondo.")
    } catch (e: javax.net.ssl.SSLException) {
        Resource.Error("Errore SSL/Certificato: ${e.localizedMessage}")
    } catch (e: java.io.IOException) {
        Resource.Error("Errore di rete: ${e.localizedMessage ?: "Verifica la connessione"}")
    } catch (e: Exception) {
        Resource.Error("Errore: ${e.javaClass.simpleName} - ${e.localizedMessage ?: e.message ?: "Errore sconosciuto"}")
    }
}
