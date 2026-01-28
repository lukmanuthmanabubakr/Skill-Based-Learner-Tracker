import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "SkillBased Tracker API",
    version: "1.0.0",
    description: "API documentation for the SkillBased Tracker backend",
  },

  // This makes it work both locally + production
  servers: [
    {
      url: process.env.API_BASE_URL || "http://localhost:5050",
      description: "Base server",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },

    schemas: {
      // ===== AUTH =====
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Legend" },
          email: { type: "string", example: "legend@mail.com" },
          password: { type: "string", example: "Password123!" },
        },
      },

      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "legend@mail.com" },
          password: { type: "string", example: "Password123!" },
        },
      },

      AuthResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          token: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
          data: {
            type: "object",
            properties: {
              _id: { type: "string", example: "65b9d2f6c2f1a2..." },
              name: { type: "string", example: "Legend" },
              email: { type: "string", example: "legend@mail.com" },
            },
          },
        },
      },

      UserResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              _id: { type: "string", example: "65b9d2f6c2f1a2..." },
              name: { type: "string", example: "Legend" },
              email: { type: "string", example: "legend@mail.com" },
            },
          },
        },
      },

      UpdateUserRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "Legend Updated" },
          email: { type: "string", example: "legend2@mail.com" },
        },
      },

      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Invalid credentials" },
          errors: { type: "array", items: { type: "string" } },
        },
      },

      // ===== SKILLS =====
      Skill: {
        type: "object",
        properties: {
          _id: { type: "string", example: "66a1b2c3d4e5f6a7b8c9d0e1" },
          name: { type: "string", example: "JavaScript" },
          specialization: {
            type: "array",
            items: { type: "string" },
            example: ["backend", "api"],
          },
          level: { type: "string", example: "beginner" },
          isArchived: { type: "boolean", example: false },
          createdAt: { type: "string", example: "2026-01-24T10:00:00.000Z" },
          updatedAt: { type: "string", example: "2026-01-24T10:00:00.000Z" },
        },
      },

      CreateSkillRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "JavaScript" },
          specialization: {
            type: "array",
            items: { type: "string" },
            example: ["backend", "api"],
          },
          level: {
            type: "string",
            example: "beginner",
            description: "Use your allowed enum values",
          },
        },
      },

      UpdateSkillRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "Node.js" },
          specialization: {
            type: "array",
            items: { type: "string" },
            example: ["backend", "express"],
          },
          level: { type: "string", example: "intermediate" },
        },
      },

      SkillsListResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Skill" },
          },
        },
      },

      SkillResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/Skill" },
        },
      },

      BulkDeleteRequest: {
        type: "object",
        required: ["skillIds"],
        properties: {
          skillIds: {
            type: "array",
            items: { type: "string" },
            example: ["66a1b2c3d4e5f6a7b8c9d0e1", "66a1b2c3d4e5f6a7b8c9d0e2"],
          },
        },
      },

      BulkDeleteResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Skills deleted successfully" },
          deletedCount: { type: "number", example: 2 },
        },
      },

      // ===== PRACTICE LOGS =====

      PracticeLog: {
        type: "object",
        properties: {
          _id: { type: "string", example: "67b1c2d3e4f5061789aa1122" },
          skillId: { type: "string", example: "66a1b2c3d4e5f6a7b8c9d0e1" },
          duration: { type: "number", example: 45 },
          notes: {
            type: "string",
            example: "Reviewed arrays and practiced loops.",
          },
          createdAt: { type: "string", example: "2026-01-24T10:00:00Z" },
          updatedAt: { type: "string", example: "2026-01-24T11:00:00Z" },
        },
      },

      CreatePracticeRequest: {
        type: "object",
        required: ["duration"],
        properties: {
          duration: { type: "number", example: 30 },
          notes: { type: "string", example: "Practiced recursion." },
        },
      },

      UpdatePracticeRequest: {
        type: "object",
        properties: {
          duration: { type: "number", example: 60 },
          notes: { type: "string", example: "Updated practice notes." },
        },
      },

      PracticeListResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/PracticeLog" },
          },
        },
      },

      PracticeResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/PracticeLog" },
        },
      },

      // ===== EVIDENCE =====

      Evidence: {
        type: "object",
        properties: {
          _id: { type: "string", example: "6799aa11bb22cc33dd44ee55" },
          practiceLogId: {
            type: "string",
            example: "67b1c2d3e4f5061789aa1122",
          },
          title: { type: "string", example: "LeetCode screenshot" },
          url: { type: "string", example: "https://example.com/my-proof.png" },
          note: {
            type: "string",
            example: "Solved 2 sum and explained approach.",
          },
          createdAt: { type: "string", example: "2026-01-24T10:00:00Z" },
          updatedAt: { type: "string", example: "2026-01-24T10:00:00Z" },
        },
      },

      CreateEvidenceRequest: {
        type: "object",
        required: ["title", "url"],
        properties: {
          title: { type: "string", example: "GitHub PR" },
          url: {
            type: "string",
            example: "https://github.com/user/repo/pull/12",
          },
          note: {
            type: "string",
            example: "Implemented practice log endpoint.",
          },
        },
      },

      EvidenceListResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Evidence" },
          },
        },
      },

      EvidenceResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/Evidence" },
        },
      },

      // ===== ANALYTICS =====

      SkillProgressResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              skillId: { type: "string", example: "66a1b2c3d4e5f6a7b8c9d0e1" },
              totalSessions: { type: "number", example: 12 },
              totalMinutes: { type: "number", example: 540 },
              lastPracticedAt: {
                type: "string",
                example: "2026-01-22T12:00:00Z",
              },
            },
          },
        },
      },

      UserSummaryResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              totalSkills: { type: "number", example: 5 },
              activeSkills: { type: "number", example: 4 },
              archivedSkills: { type: "number", example: 1 },
              totalPracticeSessions: { type: "number", example: 20 },
              totalPracticeMinutes: { type: "number", example: 900 },
            },
          },
        },
      },

      SkillTimelineResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string", example: "2026-01-24" },
                minutes: { type: "number", example: 45 },
                sessions: { type: "number", example: 1 },
              },
            },
          },
        },
      },

      UserStreaksResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              currentStreak: { type: "number", example: 3 },
              longestStreak: { type: "number", example: 10 },
              lastPracticeDate: { type: "string", example: "2026-01-24" },
            },
          },
        },
      },

      // ===== RANKINGS =====

      RankingItem: {
        type: "object",
        properties: {
          userId: { type: "string", example: "65b9d2f6c2f1a2..." },
          name: { type: "string", example: "Legend" },
          value: { type: "number", example: 120 },
        },
      },

      RankingListResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/RankingItem" },
          },
        },
      },

      UserLeaderboardItem: {
        type: "object",
        properties: {
          userId: { type: "string", example: "65b9d2f6c2f1a2..." },
          name: { type: "string", example: "Legend" },
          hoursPracticed: { type: "number", example: 15 },
          milestones: { type: "number", example: 4 },
          rank: { type: "number", example: 1 },
        },
      },

      UserLeaderboardResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/UserLeaderboardItem" },
          },
        },
      },

      SkillLeaderboardItem: {
        type: "object",
        properties: {
          skillId: { type: "string", example: "66a1b2c3d4e5f6a7b8c9d0e1" },
          userId: { type: "string", example: "65b9d2f6c2f1a2..." },
          name: { type: "string", example: "Legend" },
          hoursPracticed: { type: "number", example: 10 },
          rank: { type: "number", example: 1 },
        },
      },

      SkillLeaderboardResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/SkillLeaderboardItem" },
          },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,

  // IMPORTANT: point swagger-jsdoc to your route files
  apis: [`${process.cwd()}/src/routes/*.js`],
};

export const swaggerSpec = swaggerJSDoc(options);
