import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box } from "@mui/material";
import PropTypes from "prop-types";

const SortableItem = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    width: "100%",
  };

  return (
    <Box ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </Box>
  );
};

const DashboardLayout = ({ widgets, initialOrder, onOrderChange }) => {
  const [order, setOrder] = useState([]);

  useEffect(() => {
    if (initialOrder?.length) {
      setOrder(initialOrder);
    } else {
      setOrder(widgets.map(w => w.id));
    }
  }, [initialOrder, widgets]);


  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = order.indexOf(active.id);
      const newIndex = order.indexOf(over.id);
      const newOrder = arrayMove(order, oldIndex, newIndex);
      setOrder(newOrder);
      onOrderChange?.(newOrder);
    }
  };


  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <Box display="flex" flexWrap="wrap" gap={3} justifyContent="flex-start" alignItems="flex-start">
          {order.map((id, index) => {
            console.log(`🔢 Rendering widget: ${id} at index ${index}`);

            const widget = widgets.find((w) => w.id === id);
            if (!widget) {
              console.warn(`⚠️ Widget not found for ID: ${id}`);
              return null;
            }

            const boxProps =
              index < 6
                ? { flex: "1 1 300px", maxWidth: 370 }
                : { flex: "1 1 480px", maxWidth: "calc(50% - 16px)" };

            return (
              <Box key={id} {...boxProps}>
                <SortableItem id={id}>{widget.component}</SortableItem>
              </Box>
            );
          })}
        </Box>
      </SortableContext>
    </DndContext>
  );
};

DashboardLayout.propTypes = {
  widgets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      component: PropTypes.node.isRequired,
    })
  ).isRequired,
  initialOrder: PropTypes.arrayOf(PropTypes.string),
  onOrderChange: PropTypes.func,
};

export default DashboardLayout;
