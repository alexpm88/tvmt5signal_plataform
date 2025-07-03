"use client"

import { useState } from "react"
import { ChatCard } from "@/components/ui/chat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export function ChatExample() {
  const [messages, setMessages] = useState([
    {
      content: "Hola, ¿en qué puedo ayudarte hoy?",
      sender: "bot" as const,
      timestamp: new Date().toLocaleTimeString(),
    },
  ])

  const handleSendMessage = (content: string) => {
    // Añadir mensaje del usuario
    const userMessage = {
      content,
      sender: "user" as const,
      timestamp: new Date().toLocaleTimeString(),
    }
    
    setMessages((prev) => [...prev, userMessage])
    
    // Simular respuesta del bot después de un breve retraso
    setTimeout(() => {
      const botMessage = {
        content: `He recibido tu mensaje: "${content}". ¿En qué más puedo ayudarte?`,
        sender: "bot" as const,
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, botMessage])
    }, 1000)
  }

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-slate-100 relative">
      <div className="absolute inset-0 h-full w-full bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="mx-auto max-w-7xl px-6 sm:px-12 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center justify-items-center">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8 p-8 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-sm bg-white/20 max-w-xl w-full "
          >
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className=" font-bold text-3xl bg-gradient-to-r from-indigo-600 via-red-rosa-500 to-purple-600 bg-clip-text text-transparent  sm:text-4xl ">
                  {" "}
                  IA Agent  
                  <span className=" tracking-tight text-slate-900">
                    integrado en tu vida del traiding
                  </span>
                </h2>

                <p className="text-lg text-slate-600 leading-relaxed">
                  Comunícate en tiempo real con nuestro Asistente integrado. Recibe asistencia
                  y respuestas instantáneas a tus consultas sobre trading y analsis actualizado de lso mercados y posibles oportunidades a considerar, siemrpe bajo su responsabilidad. Solo ofrece un panorama general nformado de lso mercados y lo mas destacado en noticias y datos.
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-900">Características principales:</h3>
                <div className="grid gap-4">
                  {[
                    "Analisis Diario de Noticias",
                    "analissi de datos Macroeconomicos",
                    "Ideas sobre activos con garndes oportunidades",
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.5 }}
                      viewport={{ once: true }}
                      className="flex items-center space-x-3"
                    >
                      <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                      <span className="text-slate-700">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right side - Chat Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="h-[600px] p-8 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-sm bg-white/20 max-w-xl w-full"
          >
            <Card className="h-full overflow-hidden">
              <CardHeader>
                <CardTitle>Chat de Asistencia</CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-4rem)]">
                <ChatCard 
                  messages={messages} 
                  onSendMessage={handleSendMessage} 
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}