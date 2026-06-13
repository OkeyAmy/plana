from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ag_ui.core import RunAgentInput
from ag_ui.encoder import EventEncoder
from fastapi.responses import StreamingResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/agent")
async def run_agent(input: RunAgentInput):
    async def event_stream():
        encoder = EventEncoder()
        # TODO: stream agent events here
        yield encoder.encode({"type": "TEXT_MESSAGE_CONTENT", "content": "Hello from agent!"})

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.get("/health")
def health():
    return {"status": "ok"}
