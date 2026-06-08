"use client"
import React from "react"

interface Props { children: React.ReactNode }
interface State { hasError: boolean; message: string }

export class PlaybookErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: "" }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message ?? "Erro desconhecido" }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[PlaybookErrorBoundary]", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px 52px" }}>
          <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 16, fontWeight: 600, color: "#1E293B", marginBottom: 8 }}>
            Erro ao carregar Playbook
          </p>
          <p style={{ fontSize: 13, color: "#475569", marginBottom: 16, fontFamily: "monospace" }}>
            {this.state.message}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, message: "" })}
            style={{ fontSize: 12, color: "#4F46E5", background: "none", border: "1px solid rgba(79,70,229,0.25)", borderRadius: 6, padding: "8px 16px", cursor: "pointer" }}
          >
            Recarregar
          </button>
        </div>
      )
    }
    return this.props.children as React.ReactElement
  }
}
