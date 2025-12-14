import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withRole } from "@/middleware/auth";
import { recommendServices } from "@/lib/ai";

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const category = searchParams.get("category");
    const location = searchParams.get("location");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    let where: any = { isActive: true };

    if (category) where.category = category;
    if (location) {
      where.location = {
        contains: location,
        mode: "insensitive",
      };
    }

    let services;
    let total;

    if (query) {
      // AI-powered search
      const allServices = await prisma.service.findMany({
        where,
        include: {
          provider: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
      });

      const descriptions = allServices.map(
        (s: any) => `${s.name} ${s.description} ${s.tags.join(" ")}`
      );
      const similarities = await recommendServices(query, descriptions);

      // Sort by similarity and paginate
      const sortedServices = allServices
        .map((service: any, index: number) => ({
          service,
          similarity: similarities[index],
        }))
        .sort((a: any, b: any) => b.similarity - a.similarity)
        .slice(skip, skip + limit);

      services = sortedServices.map((item: any) => item.service);
      total = allServices.length;
    } else {
      services = await prisma.service.findMany({
        where,

        include: {
          provider: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
        skip,
        take: limit,
      });

      total = await prisma.service.count({ where });
    }

    return NextResponse.json({
      services: services.map((service: any) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        price: service.price,
        duration: service.duration,
        location: service.location,
        availability: service.availability,
        tags: service.tags,
        rating: service.rating,
        reviewCount: service.reviewCount,
        isActive: service.isActive,
        provider: service.provider
          ? {
              id: service.provider.id,
              name: service.provider.name,
              email: service.provider.email,
              phone: service.provider.phone,
            }
          : null,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Services list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const POST = withRole(["provider"])(
  async (request: NextRequest, user: any) => {
    try {
      const {
        name,
        description,
        category,
        price,
        duration,
        location,
        availability,
        tags,
      } = await request.json();

      // Validation
      if (
        !name ||
        !description ||
        !category ||
        !price ||
        !duration ||
        !location
      ) {
        return NextResponse.json(
          { error: "All required fields must be provided" },
          { status: 400 }
        );
      }

      const service = await prisma.service.create({
        data: {
          name,
          description,
          category,
          price,
          duration,
          location,
          availability,
          tags: tags || [],
          providerId: user.userId,
        },
      });

      return NextResponse.json(
        {
          message: "Service created successfully",
          service: {
            id: service.id,
            name: service.name,
            description: service.description,
            category: service.category,
            price: service.price,
            duration: service.duration,
            location: service.location,
            availability: service.availability,
            tags: service.tags,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Service creation error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
