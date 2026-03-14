export const FILE_CONTEXT_HEADER = '# File Context';

function trimTrailingNewline(text: string): string {
    return text.endsWith('\n') ? text.slice(0, -1) : text;
}

export function buildAIContextBlock(
    relativePaths: string[],
    contentSections: string[],
    header = FILE_CONTEXT_HEADER
): string {
    const parts: string[] = [];
    parts.push(`${header}\n`);
    parts.push('## File Tree');
    for (const relativePath of relativePaths) {
        parts.push(`- ${relativePath}`);
    }
    parts.push('\n---\n');
    parts.push(contentSections.join('\n'));
    return parts.join('\n');
}

export function buildFileContextSection(
    relativePath: string,
    text: string,
    language: string,
    descriptor?: string
): string {
    const heading = descriptor
        ? `## file: ${relativePath} (${descriptor})`
        : `## file: ${relativePath}`;

    return `${heading}\n\`\`\`${language}\n${trimTrailingNewline(text)}\n\`\`\`\n`;
}

export function buildSkippedFileContextSection(relativePath: string, message: string): string {
    return `## file: ${relativePath}\n> [${message}]\n`;
}

export function appendAIContextBlock(
    existingClipboardText: string,
    newBlock: string,
    header = FILE_CONTEXT_HEADER
): { output: string; appended: boolean } {
    if (existingClipboardText.includes(header)) {
        return {
            output: existingClipboardText.trimEnd() + '\n' + newBlock,
            appended: true
        };
    }

    return {
        output: newBlock,
        appended: false
    };
}
