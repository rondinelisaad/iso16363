import { Injectable, NotFoundException } from '@nestjs/common';
import { IsoSection } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type TreeNode = IsoSection & { children: TreeNode[] };

@Injectable()
export class IsoService {
  constructor(private readonly prisma: PrismaService) {}

  async findTree(): Promise<TreeNode[]> {
    const all = await this.prisma.isoSection.findMany({ orderBy: { id: 'asc' } });
    const map = new Map<string, TreeNode>(
      all.map((n) => [n.id, { ...n, children: [] }]),
    );
    const roots: TreeNode[] = [];
    for (const node of map.values()) {
      if (node.parentId) {
        map.get(node.parentId)?.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  async findById(id: string): Promise<IsoSection & { children: IsoSection[] }> {
    const node = await this.prisma.isoSection.findUnique({
      where: { id },
      include: { children: { orderBy: { id: 'asc' } } },
    });
    if (!node) throw new NotFoundException(`Section ${id} not found`);
    return node;
  }

  async findAllMetrics() {
    return this.prisma.isoSection.findMany({
      where: { level: 3 },
      orderBy: { id: 'asc' },
    });
  }
}
