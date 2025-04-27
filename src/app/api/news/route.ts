import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - 뉴스 목록 조회 API
export async function GET(request: Request) {
	try {
		// JWT 토큰에서 사용자 정보 가져오기
		const authHeader = request.headers.get('authorization');
		if (!authHeader?.startsWith('Bearer ')) {
			return NextResponse.json(
				{ message: '인증이 필요합니다.' },
				{ status: 401 }
			);
		}

		const token = authHeader.split(' ')[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
			userId: string;
		};

		// 사용자 정보 가져오기
		const user = await prisma.user.findFirst({
			where: {
				userId: decoded.userId,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ message: '사용자를 찾을 수 없습니다.' },
				{ status: 404 }
			);
		}

		// URL에서 쿼리 파라미터 추출
		const url = new URL(request.url);
		const limit = url.searchParams.get('limit')
			? parseInt(url.searchParams.get('limit')!)
			: undefined;

		// 뉴스 조회 (파라미터에 따라 필터링)
		const news = await prisma.news.findMany({
			...(limit && { take: limit }),
		});

		return NextResponse.json({
			message: '건강뉴스 목록을 성공적으로 가져왔습니다.',
			data: news,
		});
	} catch (error) {
		console.error(
			'건강뉴스 조회 오류 상세정보:',
			error instanceof Error ? error.message : error
		);
		return NextResponse.json(
			{ message: '건강뉴스 목록을 가져오는 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}
