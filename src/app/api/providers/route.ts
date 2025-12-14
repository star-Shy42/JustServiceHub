import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, withRole } from "@/middleware/auth";
import { hashPassword } from "@/lib/auth";

export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    // Get all providers with basic info
    const providers = await prisma.user.findMany({
      where: { role: "provider" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
      },
      skip,
      take: limit,
    });

    // Get provider stats for each provider
    const providerStats = await Promise.all(
      providers.map(async (provider: any) => {
        // Get services count
        const services = await prisma.service.findMany({
          where: { providerId: provider.id },
          select: { id: true },
        });

        // Get total bookings count
        const totalBookings = await prisma.booking.count({
          where: { providerId: provider.id },
        });

        // Get average rating from reviews
        const avgRatingData = await prisma.review.aggregate({
          where: {
            service: {
              providerId: provider.id,
            },
          },
          _avg: {
            rating: true,
          },
          _count: {
            rating: true,
          },
        });

        return {
          id: provider.id,
          name: provider.name,
          email: provider.email,
          phone: provider.phone,
          address: provider.address,
          servicesCount: services.length,
          totalBookings,
          avgRating: avgRatingData._avg.rating || 0,
          reviewCount: avgRatingData._count.rating || 0,
          createdAt: provider.createdAt,
        };
      })
    );

    const total = await prisma.user.count({
      where: { role: "provider" },
    });

    return NextResponse.json({
      providers: providerStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Providers list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

export const POST = withRole(["admin"])(
  async (request: NextRequest, user: any) => {
    try {
      const { name, email, password, phone, address } = await request.json();

      // Validation
      if (!name || !email || !password) {
        return NextResponse.json(
          { error: "Name, email, and password are required" },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 400 }
        );
      }

      // Create provider
      const provider = await prisma.user.create({
        data: {
          name,
          email,
          password: hashPassword(password),
          phone,
          address,
          role: "provider",
        },
      });

      return NextResponse.json(
        {
          message: "Provider created successfully",
          provider: {
            id: provider.id,
            name: provider.name,
            email: provider.email,
            phone: provider.phone,
            address: provider.address,
            role: provider.role,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Provider creation error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
