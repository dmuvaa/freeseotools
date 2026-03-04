'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { LinkNode, LinkEdge } from '@/lib/analysis/types';

interface LinkGraphProps {
    nodes: LinkNode[];
    edges: LinkEdge[];
    width?: number;
    height?: number;
}

export function LinkGraph({ nodes, edges, width = 800, height = 600 }: LinkGraphProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [selectedNode, setSelectedNode] = useState<LinkNode | null>(null);

    useEffect(() => {
        if (!svgRef.current || nodes.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove(); // Clear previous render

        // Deep copy to avoid mutating props during simulation
        const simulationNodes = nodes.map(d => ({ ...d }));
        const simulationLinks = edges.map(d => ({ ...d }));

        const simulation = d3.forceSimulation(simulationNodes as any)
            .force('link', d3.forceLink(simulationLinks).id((d: any) => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collide', d3.forceCollide(30));

        // Add Zoom
        const g = svg.append('g');
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);

        // Render Edges
        const link = g.append('g')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6)
            .selectAll('line')
            .data(simulationLinks)
            .join('line')
            .attr('stroke-width', 1);

        // Render Nodes
        const node = g.append('g')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1.5)
            .selectAll('circle')
            .data(simulationNodes)
            .join('circle')
            .attr('r', 6)
            .attr('fill', (d: any) => d.depth === 0 ? '#ef4444' : '#3b82f6') // Red for root, Blue for others
            .call(drag(simulation) as any)
            .on('click', (event, d: any) => {
                setSelectedNode(nodes.find(n => n.id === d.id) || null);
                event.stopPropagation();
            });

        node.append('title')
            .text((d: any) => d.id);

        simulation.on('tick', () => {
            link
                .attr('x1', (d: any) => d.source.x)
                .attr('y1', (d: any) => d.source.y)
                .attr('x2', (d: any) => d.target.x)
                .attr('y2', (d: any) => d.target.y);

            node
                .attr('cx', (d: any) => d.x)
                .attr('cy', (d: any) => d.y);
        });

        // Reset zoom on click background
        svg.on('click', () => setSelectedNode(null));

        function drag(simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>) {
            function dragstarted(event: any) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }

            function dragged(event: any) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }

            function dragended(event: any) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }

            return d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended);
        }

        return () => {
            simulation.stop();
        };
    }, [nodes, edges, width, height]);

    return (
        <div className="relative border rounded-xl overflow-hidden bg-slate-900 border-slate-800 shadow-2xl">
            <svg
                ref={svgRef}
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className="cursor-move" // Indicate pannable
            />

            {selectedNode && (
                <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur p-4 rounded-lg border border-slate-700 max-w-xs text-sm text-slate-200 shadow-xl">
                    <h4 className="font-bold text-white mb-1 truncate" title={selectedNode.id}>{selectedNode.id}</h4>
                    <p>Type: <span className="text-emerald-400">{selectedNode.type}</span></p>
                    {selectedNode.depth !== undefined && <p>Depth: {selectedNode.depth}</p>}
                </div>
            )}

            <div className="absolute bottom-4 left-4 text-xs text-slate-400 pointer-events-none">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 block"></span> Root Page
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span className="w-3 h-3 rounded-full bg-blue-500 block"></span> Internal Link
                </div>
                <div className="mt-2 text-[10px] opacity-70">
                    Scroll to zoom • Drag to move
                </div>
            </div>
        </div>
    );
}
