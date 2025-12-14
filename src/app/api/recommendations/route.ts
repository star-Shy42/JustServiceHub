import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/middleware/auth";
import { recommendServices } from "@/lib/ai";

export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Get all active services with provider info
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: {
        provider: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      take: 100, // Limit for performance
    });

    // Filter out services without providers
    const validServices = services.filter((service: any) => service.provider);

    if (validServices.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    // Create service descriptions for AI matching
    const serviceDescriptions = validServices.map(
      (service: any) =>
        `${service.name} ${service.description} ${
          service.category
        } ${service.tags.join(" ")}`
    );

    // Get AI recommendations
    const similarities = await recommendServices(query, serviceDescriptions);

    // Sort services by similarity score and return top results
    const recommendations = validServices
      .map((service: any, index: number) => ({
        service,
        similarity: similarities[index],
      }))
      .sort((a: any, b: any) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(({ service, similarity }: any) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        price: service.price,
        duration: service.duration,
        location: service.location,
        rating: service.rating,
        reviewCount: service.reviewCount,
        tags: service.tags,
        provider: {
          name: service.provider.name,
        },
        relevanceScore: Math.round(similarity * 100) / 100, // Round to 2 decimal places
      }));

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
