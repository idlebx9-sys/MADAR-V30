import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure, adminProcedure } from './_core/trpc.ts';
import { db, getDB, saveDB } from './db.ts';
import { hashPassword, verifyPassword, signSessionToken } from './_core/auth.ts';
import { setAuthCookies, clearAuthCookies } from './_core/cookies.ts';
import { commerce } from './commerce.ts';

export const appRouter = router({
  // ================= AUTH ROUTER =================
  auth: router({
    me: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return null;
      const user = await db.users.findById(ctx.user.userId);
      if (!user) return null;
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    }),

    register: publicProcedure
      .input(
        z.object({
          name: z.string().min(2, 'الاسم يجب أن لا يقل عن حرفين'),
          email: z.string().email('صيغة البريد الإلكتروني غير صحيحة'),
          password: z.string().min(6, 'كلمة المرور يجب أن لا تقل عن 6 خانات'),
          role: z.enum(['owner', 'user']).default('owner'),
          phone: z.string().optional(),
          city: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const normalizedEmail = input.email.toLowerCase().trim();
        const existing = await db.users.findByEmail(normalizedEmail);
        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'البريد الإلكتروني مسجل مسبقاً في المنصة',
          });
        }
        const passwordHash = await hashPassword(input.password);
        const newUser = await db.users.create({
          name: input.name.trim(),
          email: normalizedEmail,
          passwordHash,
          role: input.role,
          phone: input.phone?.trim() || '',
          city: input.city?.trim() || 'الرياض',
        });

        const token = await signSessionToken({
          userId: newUser.id,
          email: newUser.email,
          role: newUser.role,
          name: newUser.name,
        });

        setAuthCookies(ctx.res, token);
        const { passwordHash: _, ...safeUser } = newUser;
        return { ...safeUser, token };
      }),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().email('صيغة البريد الإلكتروني غير صحيحة'),
          password: z.string().min(1, 'يرجى إدخال كلمة المرور'),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const normalizedEmail = input.email.toLowerCase().trim();
        const user = await db.users.findByEmail(normalizedEmail);
        if (!user || !user.passwordHash) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
          });
        }
        const isValid = await verifyPassword(input.password, user.passwordHash);
        if (!isValid) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
          });
        }

        const token = await signSessionToken({
          userId: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        });

        setAuthCookies(ctx.res, token);
        const { passwordHash: _, ...safeUser } = user;
        return { ...safeUser, token };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      clearAuthCookies(ctx.res);
      return { success: true };
    }),

    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().min(2, 'الاسم يجب أن لا يقل عن حرفين'),
          email: z.string().email('صيغة البريد الإلكتروني غير صحيحة').optional(),
          phone: z.string().optional(),
          city: z.string().optional(),
          nationality: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const updated = await db.users.update(ctx.user.userId, input);
        if (!updated) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'المستخدم غير موجود' });
        }
        const { passwordHash: _, ...safeUser } = updated;
        return safeUser;
      }),

    changePassword: protectedProcedure
      .input(
        z.object({
          currentPassword: z.string().min(1, 'يرجى إدخال كلمة المرور الحالية'),
          newPassword: z.string().min(6, 'كلمة المرور الجديدة يجب أن لا تقل عن 6 خانات'),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const user = await db.users.findById(ctx.user.userId);
        if (!user || !user.passwordHash) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'المستخدم غير موجود' });
        }
        const isValid = await verifyPassword(input.currentPassword, user.passwordHash);
        if (!isValid) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'كلمة المرور الحالية غير صحيحة' });
        }
        const newHash = await hashPassword(input.newPassword);
        await db.users.update(ctx.user.userId, { passwordHash: newHash });
        return { success: true, message: 'تم تحديث كلمة المرور بنجاح' };
      }),
  }),

  // ================= SITES ROUTER =================
  sites: router({
    listAll: publicProcedure.query(async () => {
      return await db.sites.listAll();
    }),

    listMine: protectedProcedure.query(async ({ ctx }) => {
      return await db.sites.listByUserId(ctx.user.userId);
    }),

    listMySites: protectedProcedure.query(async ({ ctx }) => {
      return await db.sites.listByUserId(ctx.user.userId);
    }),

    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const site = await db.sites.findById(input.id);
      if (!site) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'مكتب الزواج غير موجود' });
      }
      return site;
    }),

    getBySubdomain: publicProcedure
      .input(z.object({ subdomain: z.string() }))
      .query(async ({ input }) => {
        const site = await db.sites.findBySubdomain(input.subdomain);
        if (!site) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'مكتب الزواج غير موجود' });
        }
        return site;
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(3, 'اسم المكتب يجب أن يكون 3 أحرف على الأقل'),
          subdomain: z
            .string()
            .min(3, 'اسم الرابط الفرعي قصير جداً')
            .regex(/^[a-z0-9-]+$/, 'الرابط الفرعي يجب أن يحتوي على حروف إنجليزية وأرقام وشرطات فقط'),
          template: z.enum(['traditional', 'modern', 'luxury', 'family', 'professional', 'islamic']),
          ownerName: z.string().optional(),
          ownerEmail: z.string().optional(),
          ownerPhone: z.string().optional(),
          tagline: z.string().optional(),
          officePhone: z.string().optional(),
          officeAddress: z.string().optional(),
          officeWorkingHours: z.string().optional(),
          officeLicenseNumber: z.string().optional(),
          officeYearsOfExperience: z.number().default(5),
          officeAbout: z.string().optional(),
          quranVerse: z.string().optional(),
          hadithText: z.string().optional(),
          whatsappNumber: z.string().optional(),
          emailContact: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const existing = await db.sites.findBySubdomain(input.subdomain);
        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'هذا الرابط الفرعي محجوز مسبقاً، يرجى اختيار اسم آخر',
          });
        }
        const newSite = await db.sites.create({
          ...input,
          userId: ctx.user.userId,
          status: 'pending', // Strictly pending admin review and approval!
        });
        return newSite;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          tagline: z.string().optional(),
          template: z.enum(['traditional', 'modern', 'luxury', 'family', 'professional', 'islamic']).optional(),
          officePhone: z.string().optional(),
          officeAddress: z.string().optional(),
          officeWorkingHours: z.string().optional(),
          officeLicenseNumber: z.string().optional(),
          officeYearsOfExperience: z.number().optional(),
          officeAbout: z.string().optional(),
          quranVerse: z.string().optional(),
          hadithText: z.string().optional(),
          successRate: z.number().optional(),
          totalMarriages: z.number().optional(),
          whatsappNumber: z.string().optional(),
          emailContact: z.string().optional(),
          primaryColor: z.string().optional(),
          customDomain: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const site = await db.sites.findById(input.id);
        if (!site) throw new TRPCError({ code: 'NOT_FOUND', message: 'الموقع غير موجود' });
        if (site.userId !== ctx.user.userId && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'ليس لديك صلاحية تعديل هذا الموقع' });
        }
        const updated = await db.sites.update(input.id, input);
        return updated;
      }),
  }),

  // ================= MARRIAGE REQUESTS ROUTER (طلبات الزواج) =================
  marriageRequests: router({
    create: publicProcedure
      .input(
        z.object({
          siteId: z.number(),
          fullName: z.string().min(3, 'يرجى إدخال الاسم الثلاثي كاملاً'),
          gender: z.enum(['male', 'female']),
          age: z.number().min(18, 'العمر يجب أن يكون 18 سنة على الأقل').max(80, 'يرجى التحقق من العمر المدخل'),
          maritalStatus: z.enum(['single', 'divorced', 'widowed']),
          city: z.string().min(2, 'يرجى كتابة المدينة'),
          nationality: z.string().min(2, 'يرجى كتابة الجنسية'),
          education: z.string().optional(),
          job: z.string().optional(),
          height: z.number().optional(),
          weight: z.number().optional(),
          religiousCommitment: z.string().optional(),
          financialStatus: z.string().optional(),
          partnerRequirements: z.string().min(40, 'يرجى كتابة مواصفات الشريك المطلوبة باستفاضة (40 حرفاً على الأقل)'),
          phone: z.string().min(8, 'يرجى كتابة رقم هاتف صحيح مع مفتاح الدولة'),
          email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
          preferredContact: z.enum(['whatsapp', 'call', 'email']),
          guardianPhone: z.string().optional(),
          notes: z.string().optional(),
          photoUrl: z.string().optional(),
          termsAccepted: z.boolean().refine((val) => val === true, 'يجب الموافقة على الشروط والأحكام والسرية'),
          honeypot: z.string().optional(), // Antispam honeypot
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (input.honeypot && input.honeypot.trim() !== '') {
          // Silent drop for bots
          return { success: true, id: 0 };
        }
        const { honeypot: _, ...data } = input;
        const newReq = await db.marriageRequests.create({
          ...data,
          userId: ctx.user?.userId || null,
        });
        return { success: true, id: newReq.id, message: 'تم إرسال طلب الزواج بنجاح وسيتواصل معك مستشار المكتب في أقرب وقت.' };
      }),

    list: protectedProcedure
      .input(
        z.object({
          siteId: z.number(),
          status: z.string().optional(),
          gender: z.string().optional(),
          city: z.string().optional(),
          search: z.string().optional(),
        })
      )
      .query(async ({ input, ctx }) => {
        const site = await db.sites.findById(input.siteId);
        if (!site) throw new TRPCError({ code: 'NOT_FOUND', message: 'الموقع غير موجود' });
        if (site.userId !== ctx.user.userId && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'غير مصرح بعرض طلبات هذا المكتب' });
        }
        return await db.marriageRequests.listBySiteId(input.siteId, {
          status: input.status,
          gender: input.gender,
          city: input.city,
          search: input.search,
        });
      }),

    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const req = await db.marriageRequests.findById(input.id);
      if (!req) throw new TRPCError({ code: 'NOT_FOUND', message: 'طلب الزواج غير موجود' });
      return req;
    }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(['new', 'reviewed', 'contacted', 'matched', 'closed']),
        })
      )
      .mutation(async ({ input }) => {
        const updated = await db.marriageRequests.updateStatus(input.id, input.status);
        if (!updated) throw new TRPCError({ code: 'NOT_FOUND', message: 'الطلب غير موجود' });
        return updated;
      }),

    updateNotes: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          internalNotes: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const updated = await db.marriageRequests.updateNotes(input.id, input.internalNotes);
        if (!updated) throw new TRPCError({ code: 'NOT_FOUND', message: 'الطلب غير موجود' });
        return updated;
      }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.marriageRequests.delete(input.id);
      return { success: true };
    }),

    addNote: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          notes: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const updated = await db.marriageRequests.updateNotes(input.id, input.notes);
        if (!updated) throw new TRPCError({ code: 'NOT_FOUND', message: 'الطلب غير موجود' });
        return updated;
      }),

    getStats: protectedProcedure
      .input(z.object({ siteId: z.number() }))
      .query(async ({ input }) => {
        const list = await db.marriageRequests.listBySiteId(input.siteId);
        return {
          total: list.length,
          pending: list.filter((r) => r.status === 'new' || r.status === 'reviewed').length,
          matched: list.filter((r) => r.status === 'matched').length,
          closed: list.filter((r) => r.status === 'closed').length,
        };
      }),

    // Client procedures for tracking requests and status updates
    clientRequests: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.users.findById(ctx.user.userId);
      return await db.marriageRequests.listForClient(ctx.user.userId, user?.email);
    }),

    clientGetRequest: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const user = await db.users.findById(ctx.user.userId);
        const req = await db.marriageRequests.findById(input.id);
        if (!req) throw new TRPCError({ code: 'NOT_FOUND', message: 'طلب الزواج غير موجود' });
        if (req.userId !== ctx.user.userId && (!user || req.email?.toLowerCase() !== user.email.toLowerCase())) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'غير مصرح بعرض هذا الطلب' });
        }
        const site = await db.sites.findById(req.siteId);
        return { ...req, site };
      }),

    clientWithdraw: protectedProcedure
      .input(z.object({ id: z.number(), reason: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.users.findById(ctx.user.userId);
        const req = await db.marriageRequests.findById(input.id);
        if (!req) throw new TRPCError({ code: 'NOT_FOUND', message: 'الطلب غير موجود' });
        if (req.userId !== ctx.user.userId && (!user || req.email?.toLowerCase() !== user.email.toLowerCase())) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'غير مصرح بسحب هذا الطلب' });
        }
        const updated = await db.marriageRequests.updateStatus(input.id, 'closed');
        if (input.reason) {
          await db.marriageRequests.updateNotes(
            input.id,
            (req.internalNotes || '') + `\n[تم سحب/إغلاق الطلب من قِبل المستفيد: ${input.reason}]`
          );
        }
        return updated;
      }),

    clientUpdateRequirements: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          partnerRequirements: z.string().min(10, 'شروط ومواصفات الشريك يجب أن تكون واضحة'),
          phone: z.string().min(8, 'رقم هاتف التواصل مطلوب'),
          preferredContact: z.enum(['whatsapp', 'call', 'email']).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const user = await db.users.findById(ctx.user.userId);
        const req = await db.marriageRequests.findById(input.id);
        if (!req) throw new TRPCError({ code: 'NOT_FOUND', message: 'الطلب غير موجود' });
        if (req.userId !== ctx.user.userId && (!user || req.email?.toLowerCase() !== user.email.toLowerCase())) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'غير مصرح بتعديل هذا الطلب' });
        }
        return await db.marriageRequests.update(input.id, {
          partnerRequirements: input.partnerRequirements,
          phone: input.phone,
          preferredContact: input.preferredContact || req.preferredContact,
        });
      }),
  }),

  // ================= SUCCESS STORIES ROUTER =================
  successStories: router({
    list: publicProcedure.input(z.object({ siteId: z.number() })).query(async ({ input }) => {
      return await db.successStories.listPublic(input.siteId);
    }),

    listMine: protectedProcedure.input(z.object({ siteId: z.number() })).query(async ({ input }) => {
      return await db.successStories.listMine(input.siteId);
    }),

    create: protectedProcedure
      .input(
        z.object({
          siteId: z.number(),
          title: z.string().min(3, 'العنوان مطلوب'),
          story: z.string().min(10, 'تفاصيل القصة مطلوبة'),
          brideName: z.string().optional(),
          groomName: z.string().optional(),
          marriageDate: z.string().optional(),
          imageUrl: z.string().optional(),
          isPublic: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        return await db.successStories.create(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          story: z.string().optional(),
          brideName: z.string().optional(),
          groomName: z.string().optional(),
          marriageDate: z.string().optional(),
          imageUrl: z.string().optional(),
          isPublic: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.successStories.update(input.id, input);
      }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.successStories.delete(input.id);
      return { success: true };
    }),
  }),

  // ================= ARTICLES ROUTER =================
  articles: router({
    list: publicProcedure.input(z.object({ siteId: z.number() })).query(async ({ input }) => {
      return await db.articles.listPublic(input.siteId);
    }),

    listMine: protectedProcedure.input(z.object({ siteId: z.number() })).query(async ({ input }) => {
      return await db.articles.listMine(input.siteId);
    }),

    create: protectedProcedure
      .input(
        z.object({
          siteId: z.number(),
          title: z.string().min(3, 'عنوان المقال مطلوب'),
          content: z.string().min(20, 'محتوى المقال مطلوب'),
          category: z.string().default('نصائح أسرية'),
          imageUrl: z.string().optional(),
          published: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        return await db.articles.create(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          content: z.string().optional(),
          category: z.string().optional(),
          imageUrl: z.string().optional(),
          published: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.articles.update(input.id, input);
      }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.articles.delete(input.id);
      return { success: true };
    }),
  }),

  // ================= PACKAGES ROUTER =================
  packages: router({
    list: publicProcedure.input(z.object({ siteId: z.number() })).query(async ({ input }) => {
      return await db.packages.listPublic(input.siteId);
    }),

    create: protectedProcedure
      .input(
        z.object({
          siteId: z.number(),
          name: z.string().min(2, 'اسم الباقة مطلوب'),
          description: z.string().optional(),
          price: z.string(),
          currency: z.string().default('SAR'),
          features: z.array(z.string()),
          isPopular: z.boolean().default(false),
          sortOrder: z.number().default(0),
        })
      )
      .mutation(async ({ input }) => {
        return await db.packages.create(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          price: z.string().optional(),
          features: z.array(z.string()).optional(),
          isPopular: z.boolean().optional(),
          sortOrder: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.packages.update(input.id, input);
      }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.packages.delete(input.id);
      return { success: true };
    }),
  }),

  // ================= FAQS ROUTER =================
  faqs: router({
    list: publicProcedure.input(z.object({ siteId: z.number() })).query(async ({ input }) => {
      return await db.faqs.listPublic(input.siteId);
    }),

    create: protectedProcedure
      .input(
        z.object({
          siteId: z.number(),
          question: z.string().min(3, 'السؤال مطلوب'),
          answer: z.string().min(5, 'الإجابة مطلوبة'),
          sortOrder: z.number().default(0),
        })
      )
      .mutation(async ({ input }) => {
        return await db.faqs.create(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          question: z.string().optional(),
          answer: z.string().optional(),
          sortOrder: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.faqs.update(input.id, input);
      }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.faqs.delete(input.id);
      return { success: true };
    }),
  }),

  // ================= MESSAGES ROUTER =================
  messages: router({
    send: publicProcedure
      .input(
        z.object({
          siteId: z.number(),
          name: z.string().min(2, 'الاسم مطلوب'),
          phone: z.string().min(8, 'رقم الهاتف مطلوب'),
          email: z.string().email('بريد غير صحيح').optional().or(z.literal('')),
          subject: z.string().optional(),
          content: z.string().min(5, 'نص الرسالة مطلوب'),
        })
      )
      .mutation(async ({ input }) => {
        const s = await getDB();
        const id = (s.messages.reduce((max, m) => Math.max(max, m.id), 0) || 0) + 1;
        const msg = {
          id,
          ...input,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        s.messages.unshift(msg);

        // Notify site owner
        const site = s.sites.find((st) => st.id === input.siteId);
        if (site) {
          const notifId = (s.notifications.reduce((max, n) => Math.max(max, n.id), 0) || 0) + 1;
          s.notifications.unshift({
            id: notifId,
            userId: site.userId,
            title: `استفسار جديد من: ${input.name}`,
            message: input.content.slice(0, 80) + '...',
            type: 'inquiry',
            isRead: false,
            link: '/dashboard?tab=messages',
            createdAt: new Date().toISOString(),
          });
        }

        saveDB();
        return { success: true, id };
      }),

    listMine: protectedProcedure.input(z.object({ siteId: z.number() })).query(async ({ input }) => {
      const s = await getDB();
      return s.messages.filter((m) => m.siteId === input.siteId);
    }),
  }),

  // ================= DASHBOARD OVERVIEW =================
  dashboard: router({
    getStats: protectedProcedure.input(z.object({ siteId: z.number() })).query(async ({ input }) => {
      const s = await getDB();
      const site = s.sites.find((st) => st.id === input.siteId);
      const requests = s.marriageRequests.filter((r) => r.siteId === input.siteId);
      const newRequests = requests.filter((r) => r.status === 'new').length;
      const reviewedRequests = requests.filter((r) => r.status === 'reviewed').length;
      const matchedRequests = requests.filter((r) => r.status === 'matched').length;
      const stories = s.successStories.filter((st) => st.siteId === input.siteId).length;
      const analytics = s.analyticsDaily.filter((a) => a.siteId === input.siteId);
      const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
      const totalVisitors = analytics.reduce((sum, a) => sum + a.uniqueVisitors, 0);

      return {
        site,
        totalRequests: requests.length,
        newRequests,
        reviewedRequests,
        matchedRequests,
        successStoriesCount: stories,
        totalViews,
        totalVisitors,
        recentRequests: requests.slice(0, 5),
        dailyAnalytics: analytics,
      };
    }),
  }),

  // ================= PUBLIC SITE DATA (ALL 11 SECTIONS) =================
  publicSite: router({
    getData: publicProcedure.input(z.object({ subdomain: z.string() })).query(async ({ input }) => {
      const site = await db.sites.findBySubdomain(input.subdomain);
      if (!site) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'مكتب الزواج المطلوب غير موجود' });
      }

      const s = await getDB();
      const requests = s.marriageRequests.filter((r) => r.siteId === site.id);
      const matchedCount = requests.filter((r) => r.status === 'matched').length;
      const successRate = requests.length > 0 ? Math.round((matchedCount / requests.length) * 100) : null;

      const dynamicSite = {
        ...site,
        totalMarriages: matchedCount,
        successRate: successRate,
      };

      const [pkgs, faqsList, stories, articlesList] = await Promise.all([
        db.packages.listPublic(site.id),
        db.faqs.listPublic(site.id),
        db.successStories.listPublic(site.id),
        db.articles.listPublic(site.id),
      ]);

      return {
        site: dynamicSite,
        packages: pkgs,
        faqs: faqsList,
        successStories: stories,
        articles: articlesList,
      };
    }),

    recordVisit: publicProcedure
      .input(
        z.object({
          siteId: z.number(),
          path: z.string().default('/'),
          referrer: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const ip = (ctx.req?.headers?.['x-forwarded-for'] as string) || ctx.req?.socket?.remoteAddress || 'visitor';
        const userAgent = (ctx.req?.headers?.['user-agent'] as string) || '';
        return await db.sites.recordVisit(input.siteId, ip, input.path, input.referrer || '', userAgent);
      }),
  }),

  // ================= WALLET & COMMERCE =================
  wallet: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await commerce.getWallet(ctx.user.userId);
    }),

    deposit: protectedProcedure
      .input(
        z.object({
          amount: z.number().min(10, 'الحد الأدنى للشحن هو 10 دولار'),
          paymentMethod: z.string().default('credit_card'),
          txHash: z.string().optional(),
          notes: z.string().optional(),
          proofImage: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await commerce.depositFunds(
          ctx.user.userId,
          input.amount,
          input.paymentMethod,
          input.txHash,
          input.notes,
          input.proofImage
        );
      }),

    purchaseSite: protectedProcedure
      .input(z.object({ siteId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await commerce.purchaseSiteLifetime(ctx.user.userId, input.siteId);
      }),

    cancelDeposit: protectedProcedure
      .input(z.object({ id: z.number(), reason: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        return await commerce.cancelDeposit(ctx.user.userId, input.id, input.reason);
      }),
  }),

  commerce: router({
    getWallet: protectedProcedure.query(async ({ ctx }) => {
      return await commerce.getWallet(ctx.user.userId);
    }),

    deposit: protectedProcedure
      .input(
        z.object({
          amount: z.number().min(10, 'الحد الأدنى للشحن هو 10 دولار'),
          paymentMethod: z.string().default('credit_card'),
          txHash: z.string().optional(),
          notes: z.string().optional(),
          proofImage: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await commerce.depositFunds(
          ctx.user.userId,
          input.amount,
          input.paymentMethod,
          input.txHash,
          input.notes,
          input.proofImage
        );
      }),

    purchaseSiteLifetime: protectedProcedure
      .input(z.object({ siteId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await commerce.purchaseSiteLifetime(ctx.user.userId, input.siteId);
      }),
  }),

  // ================= PAYMENT METHODS =================
  paymentMethods: router({
    listActive: publicProcedure.query(async () => {
      return await db.admin.listActivePaymentMethods();
    }),
  }),

  // ================= CURRENCY =================
  currency: router({
    list: publicProcedure.query(async () => {
      return await commerce.getCurrencies();
    }),
  }),

  // ================= NOTIFICATIONS =================
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.notifications.listForUser(ctx.user.userId);
    }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await db.notifications.markAsRead(input.id, ctx.user.userId);
      }),
  }),

  // ================= ADMIN PANEL =================
  admin: router({
    getStats: adminProcedure.query(async () => {
      return await db.admin.getPlatformStats();
    }),

    getPlatformStats: adminProcedure.query(async () => {
      return await db.admin.getPlatformStats();
    }),

    listBureaus: adminProcedure.query(async () => {
      return await db.sites.listAll();
    }),

    listAllSites: adminProcedure.query(async () => {
      return await db.sites.listAll();
    }),

    listAllUsers: adminProcedure.query(async () => {
      return await db.users.listAll();
    }),

    updateBureauStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(['active', 'suspended', 'draft', 'expired']),
        })
      )
      .mutation(async ({ input }) => {
        return await db.sites.update(input.id, { status: input.status });
      }),

    updateSiteStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.sites.update(input.id, { status: input.status });
      }),

    listPaymentMethods: adminProcedure.query(async () => {
      return await db.admin.listPaymentMethods();
    }),

    updatePaymentMethod: adminProcedure
      .input(
        z.object({
          id: z.number(),
          isActive: z.boolean().optional(),
          detailsAr: z.string().optional(),
          instructions: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.admin.updatePaymentMethod(input.id, input);
      }),

    listPendingApprovals: adminProcedure.query(async () => {
      return await db.admin.listPendingApprovals();
    }),

    approveBureau: adminProcedure
      .input(
        z.object({
          id: z.number(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.admin.approveBureau(input.id, ctx.user.userId, input.notes);
      }),

    rejectBureau: adminProcedure
      .input(
        z.object({
          id: z.number(),
          reason: z.string().min(3, 'سبب الرفض مطلوب'),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.admin.rejectBureau(input.id, ctx.user.userId, input.reason);
      }),

    suspendBureau: adminProcedure
      .input(
        z.object({
          id: z.number(),
          reason: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.admin.suspendBureau(input.id, ctx.user.userId, input.reason || 'تعليق احترازي');
      }),

    reactivateBureau: adminProcedure
      .input(
        z.object({
          id: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.admin.reactivateBureau(input.id, ctx.user.userId);
      }),

    listAllRequests: adminProcedure.query(async () => {
      return await db.admin.listAllRequests();
    }),

    updateRequestStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.string(),
          internalNotes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.admin.updateRequestStatus(input.id, input.status, input.internalNotes, ctx.user.userId);
      }),

    listPortfoliosAndWallets: adminProcedure.query(async () => {
      return await db.admin.listPortfoliosAndWallets();
    }),

    adjustWalletBalance: adminProcedure
      .input(
        z.object({
          userId: z.number(),
          amount: z.number().positive('المبلغ يجب أن يكون موجباً'),
          description: z.string().min(3, 'سبب التعديل مطلوب'),
          type: z.enum(['credit', 'debit']),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.admin.adjustWalletBalance(
          input.userId,
          input.amount,
          input.description,
          input.type,
          ctx.user.userId
        );
      }),

    updateUserRole: adminProcedure
      .input(
        z.object({
          userId: z.number(),
          role: z.enum(['owner', 'user', 'admin']),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.admin.updateUserRole(input.userId, input.role, ctx.user.userId);
      }),

    listAuditLogs: adminProcedure.query(async () => {
      return await db.admin.listAuditLogs();
    }),

    listDepositRequests: adminProcedure.query(async () => {
      return await db.admin.listDepositRequests();
    }),

    approveDeposit: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await db.admin.approveDepositRequest(input.id, ctx.user.userId);
      }),

    rejectDeposit: adminProcedure
      .input(z.object({ id: z.number(), reason: z.string().min(3, 'سبب الرفض مطلوب') }))
      .mutation(async ({ input, ctx }) => {
        return await db.admin.rejectDepositRequest(input.id, ctx.user.userId, input.reason);
      }),

    adminCredit: adminProcedure
      .input(
        z.object({
          walletId: z.number(),
          amount: z.number().positive('مبلغ الإضافة يجب أن يكون أكبر من الصفر'),
          currency: z.string().default('USD'),
          reason: z.string().min(3, 'سبب الإضافة مطلوب'),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.admin.adminCredit(input.walletId, input.amount, input.currency, input.reason, ctx.user.userId);
      }),

    adminDebit: adminProcedure
      .input(
        z.object({
          walletId: z.number(),
          amount: z.number().positive('مبلغ الخصم يجب أن يكون أكبر من الصفر'),
          currency: z.string().default('USD'),
          reason: z.string().min(3, 'سبب الخصم مطلوب'),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.admin.adminDebit(input.walletId, input.amount, input.currency, input.reason, ctx.user.userId);
      }),

    refundTransaction: adminProcedure
      .input(
        z.object({
          transactionId: z.number(),
          reason: z.string().min(3, 'سبب الاسترداد مطلوب'),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.admin.refundTransaction(input.transactionId, input.reason, ctx.user.userId);
      }),

    // Payment Methods Management
    listPaymentMethods: adminProcedure.query(async () => {
      return await db.admin.listPaymentMethods();
    }),

    createPaymentMethod: adminProcedure
      .input(
        z.object({
          code: z.string().optional(),
          titleAr: z.string().min(2, 'اسم طريقة الدفع مطلوب'),
          accountName: z.string().min(2, 'اسم المستفيد مطلوب'),
          accountNumber: z.string().min(2, 'رقم الحساب مطلوب'),
          iban: z.string().min(5, 'رقم الآيبان مطلوب'),
          detailsAr: z.string().optional(),
          instructions: z.string().optional(),
          qrCodeUrl: z.string().optional(),
          isActive: z.boolean().default(true),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.admin.createPaymentMethod(input, ctx.user.userId);
      }),

    updatePaymentMethod: adminProcedure
      .input(
        z.object({
          id: z.number(),
          code: z.string().optional(),
          titleAr: z.string().optional(),
          accountName: z.string().optional(),
          accountNumber: z.string().optional(),
          iban: z.string().optional(),
          detailsAr: z.string().optional(),
          instructions: z.string().optional(),
          qrCodeUrl: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        return await db.admin.updatePaymentMethod(id, data, ctx.user.userId);
      }),

    togglePaymentMethod: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await db.admin.togglePaymentMethod(input.id, ctx.user.userId);
      }),

    deletePaymentMethod: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await db.admin.deletePaymentMethod(input.id, ctx.user.userId);
      }),
  }),

  // ================= SYSTEM & DATABASE OVERVIEW =================
  system: router({
    databaseOverview: publicProcedure.query(async () => {
      const s = await getDB();
      return {
        engine: 'MADAR Enterprise Storage Engine (File-Backed JSON DB)',
        status: 'online',
        tables: {
          users: s.users.length,
          sites: s.sites.length,
          marriageRequests: s.marriageRequests.length,
          wallets: s.wallets.length,
          transactions: s.walletTransactions.length,
          messages: s.messages.length,
          articles: s.articles.length,
          successStories: s.successStories.length,
        },
        persistedFile: 'data/madar-db.json',
        timestamp: new Date().toISOString(),
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
