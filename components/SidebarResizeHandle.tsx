import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Platform, Pressable } from 'react-native';
import { GripVertical } from 'lucide-react-native';

const isWeb = Platform.OS === 'web';

interface SidebarResizeHandleProps {
  onResize: (newWidth: number) => void;
  minWidth?: number;
  maxWidth?: number;
}

export default function SidebarResizeHandle({
  onResize,
  minWidth = 240,
  maxWidth = 460,
}: SidebarResizeHandleProps) {
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handlePointerDown = useCallback(
    (e: any) => {
      if (!isWeb) return;

      isDraggingRef.current = true;
      startXRef.current = e.clientX;
      
      const sidebar = (e.target as HTMLElement).closest('[data-sidebar]');
      if (sidebar) {
        startWidthRef.current = sidebar.getBoundingClientRect().width;
      }

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!isDraggingRef.current) return;

        requestAnimationFrame(() => {
          const deltaX = moveEvent.clientX - startXRef.current;
          const newWidth = Math.min(
            Math.max(startWidthRef.current + deltaX, minWidth),
            maxWidth
          );
          onResize(newWidth);
        });
      };

      const handlePointerUp = () => {
        isDraggingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    },
    [onResize, minWidth, maxWidth]
  );

  if (!isWeb) return null;

  return (
    <Pressable
      onPointerDown={handlePointerDown}
      style={styles.handle}
    >
      <View style={styles.handleInner}>
        <GripVertical size={16} color="#9CA3AF" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  handle: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 12,
    cursor: 'col-resize',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleInner: {
    width: 4,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 2,
    transition: 'background-color 0.2s',
  },
});
