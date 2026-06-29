import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const COLUMNS = [
  { id: "todo",       label: "To Do",      color: "var(--muted)" },
  { id: "inprogress", label: "In Progress", color: "var(--yellow)" },
  { id: "review",     label: "In Review",  color: "var(--blue)" },
  { id: "done",       label: "Done",       color: "var(--green)" },
];

const priorityColor = { High:"var(--red)", Medium:"var(--yellow)", Low:"var(--green)" };
const priorityBadge = { High:"badge-high", Medium:"badge-medium", Low:"badge-low" };

export default function SprintBoard() {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db,"stories"), snap => {
      setStories(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    await updateDoc(doc(db,"stories",draggableId), { status: destination.droppableId });
  };

  const getCol = (colId) => stories.filter(s => s.status === colId);
  const totalPoints = (colId) => getCol(colId).reduce((a,s) => a + (s.points||0), 0);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Sprint Board</div>
          <div className="page-subtitle">Drag & drop to update status · {stories.length} total stories</div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <span className="badge badge-blue">Sprint 6</span>
          <span style={{ fontSize:13, color:"var(--muted)" }}>Jun 16 – Jun 30</span>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, alignItems:"start" }}>
          {COLUMNS.map(col => {
            const cards = getCol(col.id);
            const pts = totalPoints(col.id);
            return (
              <div key={col.id}>
                {/* Column header */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10, padding:"0 4px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:10, height:10, borderRadius:"50%", background:col.color }}/>
                    <span style={{ fontWeight:600, fontSize:13 }}>{col.label}</span>
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    <span style={{ fontSize:12, background:"var(--surface)", padding:"1px 7px", borderRadius:20, color:"var(--muted)" }}>{cards.length}</span>
                    <span style={{ fontSize:12, color:"var(--blue)", fontFamily:"var(--font-mono)" }}>{pts}pt</span>
                  </div>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        minHeight: 200, borderRadius: 8,
                        background: snapshot.isDraggingOver ? "rgba(56,139,253,0.06)" : "var(--bg2)",
                        border: `1px solid ${snapshot.isDraggingOver ? "var(--blue)" : "var(--border)"}`,
                        padding: 8, transition: "all 0.15s",
                      }}
                    >
                      {cards.length === 0 && !snapshot.isDraggingOver && (
                        <div style={{ textAlign:"center", padding:"30px 10px", color:"var(--faint)", fontSize:12 }}>
                          Drop here
                        </div>
                      )}
                      {cards.map((card, index) => (
                        <Draggable key={card.id} draggableId={card.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                background: snapshot.isDragging ? "var(--bg3)" : "var(--surface)",
                                border: `1px solid ${snapshot.isDragging ? "var(--blue)" : "var(--border)"}`,
                                borderLeft: `3px solid ${priorityColor[card.priority]||"var(--muted)"}`,
                                borderRadius: 6, padding: 12, marginBottom: 8,
                                cursor: "grab", boxShadow: snapshot.isDragging ? "0 8px 24px rgba(0,0,0,0.4)" : "none",
                                ...provided.draggableProps.style,
                              }}
                            >
                              <div style={{ fontSize:13, fontWeight:500, marginBottom:8, lineHeight:1.4 }}>{card.title}</div>
                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                                <span className={`badge ${priorityBadge[card.priority]}`}>{card.priority}</span>
                                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                                  {card.assignee && (
                                    <div style={{ width:22, height:22, borderRadius:"50%", background:"var(--blue2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#fff" }}>
                                      {card.assignee[0]?.toUpperCase()}
                                    </div>
                                  )}
                                  <span style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--blue)" }}>{card.points}pt</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {stories.length === 0 && (
        <div className="empty-state" style={{ marginTop:40 }}>
          <div className="empty-state-icon">⚡</div>
          <div className="empty-state-title">No stories on the board</div>
          <p>Add stories in the Backlog first, then drag them across columns</p>
        </div>
      )}
    </div>
  );
}
