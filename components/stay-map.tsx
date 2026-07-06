"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import useSupercluster from "use-supercluster";
import "leaflet/dist/leaflet.css";
import { Box, Typography, Stack, useTheme, Theme } from "@mui/material";

interface MapStay {
    id: string;
    title: string;
    price: number;
    latitude: number;
    longitude: number;
    avgRating: number;
    images: string[];
}

function isMapStay(obj: unknown): obj is MapStay {
    if (typeof obj !== "object" || obj === null) return false;
    const s = obj as Record<string, unknown>;
    return (
        typeof s.id === "string" &&
        typeof s.title === "string" &&
        typeof s.price === "number" &&
        typeof s.latitude === "number" &&
        typeof s.longitude === "number" &&
        typeof s.avgRating === "number" &&
        Array.isArray(s.images)
    );
}

interface StayMapProps {
    stays: MapStay[];
    onBoundsChange?: (bounds: {
        sw_lat: number;
        sw_lng: number;
        ne_lat: number;
        ne_lng: number;
    }) => void;
    hoveredStayId?: string | null;
}

/** Creates a price-pill DivIcon for Leaflet markers */
function createPriceIcon(price: number, isHovered: boolean, theme: Theme) {
    const priceStr = `$${price}`;
    // Estimate width based on character count (~9px per char + 24px padding)
    const estimatedWidth = priceStr.length * 9 + 24;
    const height = 30;

    return L.divIcon({
        className: "price-marker",
        html: `<div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${estimatedWidth}px;
            height: ${height}px;
            background: ${isHovered ? theme.palette.primary.main : '#fff'};
            color: ${isHovered ? theme.palette.primary.contrastText : theme.palette.text.primary};
            font-size: 13px;
            font-weight: 700;
            border-radius: 20px;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.18);
            transform: ${isHovered ? "scale(1.15)" : "scale(1)"};
            transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            cursor: pointer;
            border: 1.5px solid ${isHovered ? theme.palette.primary.dark : 'rgba(0,0,0,0.08)'};
            font-family: ${theme.typography.fontFamily};
            line-height: 1;
        ">${priceStr}</div>`,
        iconSize: [estimatedWidth, height],
        iconAnchor: [estimatedWidth / 2, height / 2],
    });
}

/** Creates a circular badge icon for clusters */
function createClusterIcon(count: number, theme: Theme) {
    const size = 36 + (count.toString().length * 4);

    return L.divIcon({
        className: "cluster-marker",
        html: `<div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${size}px;
            height: ${size}px;
            background: ${theme.palette.primary.main};
            color: ${theme.palette.primary.contrastText};
            font-size: 14px;
            font-weight: bold;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border: 2px solid #fff;
            transition: transform 0.2s;
            cursor: pointer;
        ">${count}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

/** Handles map move/zoom events and reports bounds back to parent */
function BoundsReporter({
    onBoundsChange,
}: {
    onBoundsChange: StayMapProps["onBoundsChange"];
}) {
    const map = useMapEvents({
        moveend: () => {
            if (!onBoundsChange) return;
            const bounds = map.getBounds();
            onBoundsChange({
                sw_lat: bounds.getSouthWest().lat,
                sw_lng: bounds.getSouthWest().lng,
                ne_lat: bounds.getNorthEast().lat,
                ne_lng: bounds.getNorthEast().lng,
            });
        },
    });

    // Report initial bounds on mount
    useEffect(() => {
        if (!onBoundsChange) return;
        const bounds = map.getBounds();
        onBoundsChange({
            sw_lat: bounds.getSouthWest().lat,
            sw_lng: bounds.getSouthWest().lng,
            ne_lat: bounds.getNorthEast().lat,
            ne_lng: bounds.getNorthEast().lng,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

/** Auto-fit map bounds to show all markers */
function AutoFitBounds({ stays }: { stays: MapStay[] }) {
    const map = useMap();
    const fitted = useRef(false);

    useEffect(() => {
        if (fitted.current || stays.length === 0) return;
        const bounds = L.latLngBounds(stays.map((s) => [s.latitude, s.longitude]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13, animate: false });
        fitted.current = true;
    }, [stays, map]);

    return null;
}

/** Clustering logic component */
function ClusterOverlay({ stays, hoveredStayId, theme }: { stays: MapStay[], hoveredStayId?: string | null, theme: Theme }) {
    const map = useMap();
    const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);
    const [zoom, setZoom] = useState(map.getZoom());

    const updateBoundsAndZoom = useCallback(() => {
        const b = map.getBounds();
        setBounds([
            b.getSouthWest().lng,
            b.getSouthWest().lat,
            b.getNorthEast().lng,
            b.getNorthEast().lat
        ]);
        setZoom(map.getZoom());
    }, [map]);

    useEffect(() => {
        const timer = setTimeout(() => {
            updateBoundsAndZoom();
        }, 0);
        return () => clearTimeout(timer);
    }, [updateBoundsAndZoom]);

    useMapEvents({
        moveend: updateBoundsAndZoom,
        zoomend: updateBoundsAndZoom,
    });

    const points = useMemo(() => stays.map(stay => ({
        type: "Feature" as const,
        properties: { cluster: false, stayId: stay.id, stay },
        geometry: { type: "Point" as const, coordinates: [stay.longitude, stay.latitude] }
    })), [stays]);

    const { clusters, supercluster } = useSupercluster({
        points,
        bounds: bounds || undefined,
        zoom,
        options: { radius: 75, maxZoom: 20 }
    });

    const renderedClusters = clusters.map((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        const properties = cluster.properties;

        if (!properties || typeof properties !== 'object') {
            return null;
        }

        if ('cluster' in properties && properties.cluster === true) {
            const clusterId = cluster.id;
            const pointCount = 'point_count' in properties && typeof properties.point_count === 'number' ? properties.point_count : 0;

            return (
                <Marker
                    key={`cluster-${clusterId}`}
                    position={[latitude, longitude]}
                    icon={createClusterIcon(pointCount, theme)}
                    eventHandlers={{
                        click: () => {
                            if (supercluster && typeof clusterId === 'number') {
                                const expansionZoom = Math.min(
                                    supercluster.getClusterExpansionZoom(clusterId),
                                    20
                                );
                                map.setView([latitude, longitude], expansionZoom, {
                                    animate: true,
                                });
                            }
                        }
                    }}
                />
            );
        }

        if ('cluster' in properties && properties.cluster === false && 'stay' in properties) {
            const stay = properties.stay;
            if (isMapStay(stay)) {
                return (
                    <Marker
                        key={stay.id}
                        position={[latitude, longitude]}
                        icon={createPriceIcon(stay.price, stay.id === hoveredStayId, theme)}
                    >
                        <Popup>
                            <Link href={`/stays/${stay.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: 200 }}>
                                <Typography variant="subtitle2" fontWeight="bold" noWrap>
                                    {stay.title}
                                </Typography>
                                <Stack direction="row" alignItems="center" gap={0.5} mt={0.5}>
                                    <Typography variant="body2" fontWeight="bold" color="text.primary">
                                        ${stay.price}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        /night
                                    </Typography>
                                    {stay.avgRating > 0 && (
                                        <>
                                            <Typography variant="body2" color="text.secondary">·</Typography>
                                            <Typography variant="body2" color="text.secondary">★ {stay.avgRating.toFixed(1)}</Typography>
                                        </>
                                    )}
                                </Stack>
                            </Link>
                        </Popup>
                    </Marker>
                );
            }
        }

        return null;
    });

    return (
        <>
            {renderedClusters}
        </>
    );
}

export function StayMap({ stays, onBoundsChange, hoveredStayId }: StayMapProps) {
    const theme = useTheme();
    // Default center: US continental center
    const center = useMemo<[number, number]>(() => {
        if (stays.length === 0) return [39.8, -98.5];
        const avgLat = stays.reduce((s, st) => s + st.latitude, 0) / stays.length;
        const avgLng = stays.reduce((s, st) => s + st.longitude, 0) / stays.length;
        return [avgLat, avgLng];
    }, [stays]);

    return (
        <Box sx={{ position: 'relative', width: '100%', height: '100%', minHeight: 500 }}>
            <MapContainer
                center={center}
                zoom={5}
                scrollWheelZoom={true}
                style={{ width: "100%", height: "100%", minHeight: "500px" }}
                zoomControl={false}
            >
                {/* Modern light map tiles */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                <BoundsReporter onBoundsChange={onBoundsChange} />
                <AutoFitBounds stays={stays} />

                <ClusterOverlay stays={stays} hoveredStayId={hoveredStayId} theme={theme} />
            </MapContainer>
        </Box>
    );
}
