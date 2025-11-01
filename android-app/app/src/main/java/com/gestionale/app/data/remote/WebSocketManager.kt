package com.gestionale.app.data.remote

import android.util.Log
import com.gestionale.app.BuildConfig
import com.gestionale.app.data.models.NotificationResponse
import com.gestionale.app.data.models.WebSocketMessage
import com.gestionale.app.utils.TokenManager
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import okhttp3.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WebSocketManager @Inject constructor(
    private val okHttpClient: OkHttpClient,
    private val tokenManager: TokenManager,
    private val gson: Gson
) {
    private val TAG = "WebSocketManager"
    private var webSocket: WebSocket? = null
    private val coroutineScope = CoroutineScope(Dispatchers.IO)

    private val _notifications = MutableSharedFlow<NotificationResponse>(replay = 0)
    val notifications: Flow<NotificationResponse> = _notifications.asSharedFlow()

    private val _connectionState = MutableSharedFlow<ConnectionState>(replay = 1)
    val connectionState: Flow<ConnectionState> = _connectionState.asSharedFlow()

    enum class ConnectionState {
        CONNECTING,
        CONNECTED,
        DISCONNECTED,
        ERROR
    }

    fun connect() {
        coroutineScope.launch {
            try {
                val token = tokenManager.getToken().first()
                if (token == null) {
                    Log.e(TAG, "No token available for WebSocket connection")
                    _connectionState.emit(ConnectionState.ERROR)
                    return@launch
                }

                _connectionState.emit(ConnectionState.CONNECTING)

                val wsUrl = "${BuildConfig.WS_BASE_URL}notifications/ws?token=$token"
                val request = Request.Builder()
                    .url(wsUrl)
                    .build()

                webSocket = okHttpClient.newWebSocket(request, object : WebSocketListener() {
                    override fun onOpen(webSocket: WebSocket, response: Response) {
                        Log.d(TAG, "WebSocket connected")
                        coroutineScope.launch {
                            _connectionState.emit(ConnectionState.CONNECTED)
                        }
                    }

                    override fun onMessage(webSocket: WebSocket, text: String) {
                        Log.d(TAG, "Received message: $text")
                        try {
                            val message = gson.fromJson(text, WebSocketMessage::class.java)
                            coroutineScope.launch {
                                _notifications.emit(message.notification)
                            }
                        } catch (e: Exception) {
                            Log.e(TAG, "Error parsing WebSocket message", e)
                        }
                    }

                    override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                        Log.e(TAG, "WebSocket error", t)
                        coroutineScope.launch {
                            _connectionState.emit(ConnectionState.ERROR)
                        }
                    }

                    override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                        Log.d(TAG, "WebSocket closing: $reason")
                        webSocket.close(1000, null)
                        coroutineScope.launch {
                            _connectionState.emit(ConnectionState.DISCONNECTED)
                        }
                    }

                    override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                        Log.d(TAG, "WebSocket closed: $reason")
                        coroutineScope.launch {
                            _connectionState.emit(ConnectionState.DISCONNECTED)
                        }
                    }
                })
            } catch (e: Exception) {
                Log.e(TAG, "Error connecting WebSocket", e)
                _connectionState.emit(ConnectionState.ERROR)
            }
        }
    }

    fun disconnect() {
        webSocket?.close(1000, "User disconnected")
        webSocket = null
        coroutineScope.launch {
            _connectionState.emit(ConnectionState.DISCONNECTED)
        }
    }

    fun isConnected(): Boolean {
        return webSocket != null
    }
}
