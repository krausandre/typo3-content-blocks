<?php

declare(strict_types=1);

/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

namespace TYPO3\CMS\Composer\Scripts;

/***************************************************************
 *  Copyright notice
 *
 *  (c) 2018 Helmut Hummel <info@helhum.io>
 *  All rights reserved
 *
 *  The GNU General Public License can be found at
 *  http://www.gnu.org/copyleft/gpl.html.
 *  A copy is found in the text file GPL.txt and important notices to the license
 *  from the author is found in LICENSE.txt distributed with these scripts.
 *
 *
 *  This script is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  This copyright notice MUST APPEAR in all copies of the script!
 ***************************************************************/

use Composer\Script\Event;
use Symfony\Component\Filesystem\Filesystem;

class InstallerScripts
{
    public static function enableCommitMessageHook(Event $event): void
    {
        $filesystem = new Filesystem();
        try {
            $filesystem->copy('Build/git-hooks/commit-msg', '.git/hooks/commit-msg');
            if (!is_executable('.git/hooks/commit-msg')) {
                $filesystem->chmod('.git/hooks/commit-msg', 0755);
            }
        } catch (\Symfony\Component\Filesystem\Exception\IOException $e) {
            $event->getIO()->writeError('<warning>Exception:enableCommitMessageHook:' . $e->getMessage() . '</warning>');
        }
    }

    public static function enablePreCommitHook(Event $event): void
    {
        if (DIRECTORY_SEPARATOR === '\\') {
            return;
        }
        $filesystem = new Filesystem();
        try {
            $filesystem->copy('Build/git-hooks/unix+mac/pre-commit', '.git/hooks/pre-commit');
            if (!is_executable('.git/hooks/pre-commit')) {
                $filesystem->chmod('.git/hooks/pre-commit', 0755);
            }
        } catch (\Symfony\Component\Filesystem\Exception\IOException $e) {
            $event->getIO()->writeError('<warning>Exception:enablePreCommitHook:' . $e->getMessage() . '</warning>');
        }
    }

    public static function disablePreCommitHook(Event $event): void
    {
        $filesystem = new Filesystem();
        $filesystem->remove('.git/hooks/pre-commit');
    }
}
